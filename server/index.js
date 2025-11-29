import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import axios from "axios";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const generateZoomToken = async () => {
  const tokenURL = "https://zoom.us/oauth/token";

  const params = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: process.env.ZOOM_ACCOUNT_ID,
  });

  const auth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(tokenURL, params, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
  });

  return response.data.access_token;
};

const serviceAccount = JSON.parse(
    fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
  );  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔐 Extract token & verify user from Firebase
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized - Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 🔐 Load user role from Firestore
const loadUserRole = async (req, res, next) => {
  try {
    const userRef = await db.collection("users").doc(req.uid).get();
    if (!userRef.exists)
      return res.status(404).json({ error: "User not found" });

    req.user = userRef.data(); // contains role
    next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to load user profile" });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super-admin")
    return res.status(403).json({ error: "Access denied - Super Admin only" });

  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super-admin") {
    return res.status(403).json({ error: "Access denied - Admin only" });
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Server running successfully!");
});

app.post("/register", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("Decoded Firebase user:", decoded);
    const uid = decoded.uid;

    const { name, email, mobile, address, role, position, experience, cvUrl, certificatesUrl } = req.body;
    console.log("New User Data:", { name, email, role, position, experience });

    await db.collection("users").doc(uid).set({
      name,
      email,
      mobile,
      address,
      role,
      position,
      experience,
      cvUrl: cvUrl || null,
      certificatesUrl: certificatesUrl || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }
  );
    res.json({ 
      message: "User registered & saved in Firestore successfully",
      firebaseUid: uid,
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(401).json({ error: "Server error" });
  }
});

app.post("/login", async(req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1]

  if (!token)
    return res.status(401).json({ error: "Unauthorized - No token provided"});
  try{
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if(!userDoc.exists)
      return res.status(404).json({ error: "User profile not found"});

    const userData = userDoc.data();

    res.json({
      message: "Login Successful",
      firebaseUid: uid,
      profile: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid or expired token "});
  }
});

app.get("/user/profile", verifyToken, loadUserRole, async (req, res) => {
  try {
    res.json({
      message: "Profile loaded successfully",
      profile: req.user,
      uid: req.uid,
    });
  } catch (err) {
    console.error("Profile load error:", err);
    res.status(500).json({ error: "Failed to load user profile" });
  }
});

app.put("/update-profile", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const { name, mobile, address, position, experience } = req.body;

    await db.collection("users").doc(uid).set(
      {
        name,
        mobile,
        address,
        position,
        experience,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.post("/create-meeting", async (req, res) => {
  try {
    const { name, email, date, time, purpose } = req.body;

    const token = await generateZoomToken();

    const meetingData = {
      topic: purpose,
      type: 2,
      start_time: `${date}T${time}:00`,
      duration: 30,
      timezone: "Asia/Kolkata",
      settings: {
        host_video: true,
        participant_video: true
      }
    };

    const zoomRes = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const joinLink = zoomRes.data.join_url;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Zoom Meeting Scheduled",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your meeting has been scheduled.</p>
        <p><b>Join Zoom Meeting:</b></p>
        <a href="${joinLink}" style="color:blue">${joinLink}</a>
      `
    });

    res.json({
      success: true,
      link: joinLink,
      message: "Zoom meeting created & email sent!"
    });

  } catch (error) {
    console.error("Zoom Error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to create Zoom meeting" });
  }
});

app.post("/meeting-request", verifyToken, loadUserRole, async (req, res) => {
  try {
    const { name, email, phone, purpose, message } = req.body;

    // Save request in Firestore
    const docRef = await db.collection("meeting_requests").add({
      name,
      email,
      phone,
      purpose,
      message: message || "",
      status: "pending",
      createdBy: req.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Find admin emails
    const adminSnapshot = await db.collection("users")
      .where("role", "in", ["admin", "super-admin"])
      .get();

    const adminEmails = adminSnapshot.docs
      .map(d => d.data()?.email)
      .filter(Boolean);

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    // Email admins (if any)
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: adminEmails, // array works with nodemailer
        subject: "New Meeting Request — Action Required",
        html: `
          <h3>New Meeting Request</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Purpose:</b> ${purpose}</p>
          <p><b>Message:</b> ${message || "—"}</p>
          <p>Approve or decline this request in the admin panel.</p>
        `,
      });
    } else {
      console.log("No admins found to notify.");
    }

    // Confirmation email to requester
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "We received your meeting request",
      html: `
        <h3>Thanks for your anticipation</h3>
        <p>We have received your request for a meeting regarding <b>${purpose}</b>.</p>
        <p>We will respond to you about the date and time soon. Stay tuned!</p>
      `,
    });

    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Meeting request error:", err);
    return res.status(500).json({ error: "Failed to submit meeting request" });
  }
});

app.get("/admin/meetings", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = db.collection("meeting_requests").orderBy("createdAt", "desc");

    if (status) query = query.where("status", "==", status);

    const snap = await query.get();
    const meetings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ meetings });
  } catch (err) {
    console.error("Admin meetings error:", err);
    return res.status(500).json({ error: "Failed to fetch meeting requests" });
  }
});

app.put("/admin/meetings/:id/approve", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  const meetingId = req.params.id;
  const { date, time, durationMinutes = 30 } = req.body;

  if (!date || !time) return res.status(400).json({ error: "Missing date or time" });

  try {
    // Fetch meeting request doc
    const reqDocRef = db.collection("meeting_requests").doc(meetingId);
    const reqDoc = await reqDocRef.get();
    if (!reqDoc.exists) return res.status(404).json({ error: "Meeting request not found" });

    const reqData = reqDoc.data();

    // Create Zoom meeting
    const token = await generateZoomToken();

    const start_time = `${date}T${time}:00`; // assume local ISO-like 'YYYY-MM-DDTHH:mm:00'
    const meetingPayload = {
      topic: `Meeting: ${reqData.purpose} — ${reqData.name}`,
      type: 2,
      start_time,
      duration: durationMinutes,
      timezone: "Asia/Kolkata",
      settings: {
        host_video: true,
        participant_video: true,
      },
    };

    const zoomRes = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const joinLink = zoomRes.data.join_url;
    const meetingZoomId = zoomRes.data.id;

    // Update Firestore
    await reqDocRef.update({
      status: "approved",
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: req.uid,
      scheduledDate: date,
      scheduledTime: time,
      durationMinutes,
      zoomLink: joinLink,
      zoomId: meetingZoomId,
    });

    // Notify requester via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    const htmlForUser = `
      <h3>Your meeting has been scheduled</h3>
      <p>Hi ${reqData.name},</p>
      <p>Your meeting for <b>${reqData.purpose}</b> has been scheduled.</p>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${time}</p>
      <p><b>Duration:</b> ${durationMinutes} minutes</p>
      <p><b>Join Zoom Meeting:</b> <a href="${joinLink}">${joinLink}</a></p>
      <p>See you then.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: reqData.email,
      subject: "Your meeting is scheduled",
      html: htmlForUser,
    });

    return res.json({ success: true, zoomLink: joinLink, meetingId: meetingZoomId });
  } catch (err) {
    console.error("Approve meeting error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to approve and schedule meeting" });
  }
});

app.put("/admin/meetings/:id/decline", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  const meetingId = req.params.id;
  const { reason } = req.body;

  try {
    const ref = db.collection("meeting_requests").doc(meetingId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });

    const data = snap.data();

    await ref.update({
      status: "declined",
      declinedAt: admin.firestore.FieldValue.serverTimestamp(),
      declinedBy: req.uid,
      declineReason: reason || ""
    });

    // send email to requester
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: data.email,
      subject: "Meeting Request Declined",
      html: `
        <h3>Your meeting request was declined</h3>
        <p>Reason: ${reason || "No reason provided"}</p>
      `,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Decline error:", err);
    return res.status(500).json({ error: "Failed to decline" });
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const snapshot = await db.collection("jobs").orderBy("postedAt", "desc").get();
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load jobs" });
  }
});

app.get("/jobs/latest", async (req, res) => {
  try {
    const snapshot = await db.collection("jobs")
      .orderBy("postedAt", "desc")
      .limit(6)
      .get();

    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to load latest jobs" });
  }
});

app.get("/search-jobs", async (req, res) => {
  try {
    const { role = "", location = "" } = req.query;

    const snapshot = await db.collection("jobs").orderBy("postedAt", "desc").get();
    let jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Convert search to lowercase for flexible matching
    const r = role.toLowerCase();
    const l = location.toLowerCase();

    if (r.trim()) {
      jobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(r) ||
        job.company?.toLowerCase().includes(r)
      );
    }

    if (l.trim()) {
      jobs = jobs.filter(job =>
        job.location?.toLowerCase().includes(l)
      );
    }

    res.json({ jobs });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/blogs", async (req, res) => {
  try {
    const snapshot = await db.collection("blogs").orderBy("createdAt", "desc").get();

    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to load blogs" });
  }
});

app.post("/blogs", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized - No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Fetch user profile
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists)
      return res.status(404).json({ error: "User profile not found" });

    const user = userDoc.data();

    if (user.role !== "job-seeker")
      return res.status(403).json({ error: "Only job-seekers can create blogs" });

    // Blog payload
    const { title, content } = req.body;

    const newBlog = {
      title,
      content,
      authorId: uid,
      authorName: user.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("blogs").add(newBlog);

    return res.json({
      message: "Blog created successfully",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
});

// ⭐ ADMIN — Fetch all users
app.get("/admin/users", verifyToken, loadUserRole, async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ users });
  } catch (err) {
    console.error("Admin Users Error:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ⭐ ADMIN — Fetch all jobs
app.get("/admin/jobs", verifyToken, loadUserRole, async (req, res) => {
  try {
    const snapshot = await db.collection("jobs").get();

    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ jobs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ⭐ ADMIN — Fetch all blogs
app.get("/admin/blogs", verifyToken, loadUserRole, async (req, res) => {
  try {
    const snapshot = await db.collection("blogs").get();

    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ blogs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// ⭐ ADMIN — Update Role
app.put("/admin/update-role", verifyToken, loadUserRole, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!userId || !newRole)
      return res.status(400).json({ error: "Missing userId or newRole" });

    await db.collection("users").doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ message: "Role updated" });
  } catch (err) {
    console.error("Role Update Error:", err);
    return res.status(500).json({ error: "Role update failed" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));