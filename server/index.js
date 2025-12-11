import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import axios from "axios";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

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

import { getFirestore } from "firebase-admin/firestore";

const firestore = getFirestore();
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

const requireCompanyOwner = (req, res, next) => {
  if (req.user.role !== "company") {
    return res.status(403).json({ error: "Access denied — Company owners only" });
  }
  next();
};

async function createNotification(userId, title, message, type, metaRef = null, redirectUrl = null) {
  return await db.collection("notifications").add({
    userId,
    title,
    message,
    type,
    metaRef,
    redirectUrl,
    status: "unread",  
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

function scheduleMeetingReminder(meetingId, reqData, approvedBy, meetingStartJs, zoomLink) {
  const now = new Date();
  const oneHourBefore = new Date(meetingStartJs.getTime() - 60 * 60 * 1000);

  let runAt = oneHourBefore;

  if (oneHourBefore < now) {
    runAt = now;
  }

  const delay = runAt.getTime() - now.getTime();

  if (delay <= 0) {
    return;
  }

  setTimeout(async () => {
    try {
      const now2 = new Date();
      const diffMs = meetingStartJs - now2;
      const diffMinutes = Math.round(diffMs / 60000);

      let userMsg;
      let adminMsg;

      if (diffMinutes >= 60) {
        userMsg = `Reminder: Your meeting "${reqData.purpose}" starts in 1 hour.\nJoin: ${zoomLink}`;
        adminMsg = `Reminder: Your meeting with ${reqData.name} about "${reqData.purpose}" starts in 1 hour.\nJoin: ${zoomLink}`;
      } else {
        const mins = Math.max(diffMinutes, 1);
        userMsg = `Reminder: Your meeting "${reqData.purpose}" starts in ${mins} minutes.\nJoin: ${zoomLink}`;
        adminMsg = `Reminder: Your meeting with ${reqData.name} about "${reqData.purpose}" starts in ${mins} minutes.\nJoin: ${zoomLink}`;
      }

      // User reminder
      await createNotification(
        reqData.createdBy,
        "Meeting Reminder",
        userMsg,
        "meeting-reminder",
        meetingId,
        zoomLink
      );

      // Admin reminder
      await createNotification(
        approvedBy,
        "Meeting Reminder",
        adminMsg,
        "meeting-reminder-admin",
        meetingId, zoomLink
      );

      // Optional: mark reminderSent in Firestore
      await db.collection("meeting_requests").doc(meetingId).update({
        reminderSent: true,
      });
    } catch (err) {
      console.error("Error sending scheduled reminder:", err);
    }
  }, delay);
}

app.get("/", (req, res) => {
  res.send("Server running successfully!");
});

app.post("/register", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized - No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    let {
      name,
      email,
      mobile,
      address,
      role,
      companyName,
      position,
      experience,
      cvUrl,
      certificatesUrl,
      gender
    } = req.body;

    if (!name || !email || !mobile || !address || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const allowedGenders = ["male", "female", "other"];
    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({ error: "Invalid gender value" });
    }
    
    if (
      !experience ||
      typeof experience !== "object" ||
      experience.value == null ||
      experience.unit == null
    ) {
      return res.status(400).json({ error: "Invalid experience format" });
    }

    companyName = companyName ? companyName.trim() : null;

    let companyId = null;
    let companyRole = "employee"; // default role

    if (companyName) {
      // Check if company exists
      const companySnap = await db
        .collection("companies")
        .where("name", "==", companyName)
        .limit(1)
        .get();

      if (!companySnap.empty) {
        const doc = companySnap.docs[0];
        const companyData = doc.data();
        companyId = doc.id;

        if (companyData.status === "rejected") {
            // treat like new request → create new pending
            return res.status(400).json({
              error: "This company was previously rejected. Create a new request with a different name."
            });
        }

        if (companyData.status === "pending") {
            companyRole = "employee"; // temporary
        }

        if (companyData.status === "accepted") {
            // your existing logic
        }
      } else {
        // Create new company
        const newCompanyRef = await db.collection("companies").add({
          name: companyName,
          logoUrl: null,
          owners: [uid],
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        companyId = newCompanyRef.id;
        companyRole = "owner";
      }
    }

    // Create / update user record
    const userData = {
      name,
      email,
      mobile,
      address,
      role, // Global platform role
      companyName,
      companyId: companyId || null,
      companyRole, // Track employee or owner
      position,
      experience, // { value, unit }
      cvUrl: cvUrl || null,
      certificatesUrl: certificatesUrl || null,
      gender: gender || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(uid).set(userData, { merge: true });

    // Ensure user is listed as employee under company
    if (companyId) {
      await db
        .collection("companies")
        .doc(companyId)
        .collection("employees")
        .doc(uid)
        .set({
          name,
          email,
          position,
          companyRole,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    return res.json({
      message: "Registered successfully",
      companyAssigned: companyName || null,
      companyRole,
      companyId,
      firebaseUid: uid,
    });

  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token)
    return res.status(401).json({ error: "Unauthorized - No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    // 1️⃣ If UID does not exist in Firestore → check email instead
    if (!userDoc.exists) {
      const emailSnap = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      // 2️⃣ If Firestore user with same email already exists → use that
      if (!emailSnap.empty) {
        const existing = emailSnap.docs[0];
        return res.json({
          message: "Login Successful (email matched existing profile)",
          firebaseUid: existing.id,
          profile: existing.data(),
        });
      }

      // 3️⃣ Otherwise create new Firestore user
      const newUser = {
        name: decoded.name || "",
        email: email,
        role: "job-seeker",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await userRef.set(newUser);

      return res.json({
        message: "Google login successful - new profile created",
        firebaseUid: uid,
        profile: newUser,
      });
    }

    // 👍 Normal login path when UID already exists
    return res.json({
      message: "Login Successful",
      firebaseUid: uid,
      profile: userDoc.data(),
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});


app.get("/user/profile", verifyToken, loadUserRole, async (req, res) => {
  try {
    const userSnap = await db.collection("users").doc(req.uid).get();
    if (!userSnap.exists)
      return res.status(404).json({ error: "User profile not found" });

    const profile = { id: userSnap.id, ...userSnap.data() };

    let company = null;

    if (profile.companyId) {
      const companySnap = await db.collection("companies")
        .doc(profile.companyId)
        .get();

      if (companySnap.exists) {
        company = {
          id: companySnap.id,
          ...companySnap.data(),
        };
      }
    }

    return res.json({
      message: "Profile loaded successfully",
      profile,
      company,
      uid: req.uid,
    });

  } catch (err) {
    console.error("Profile load error:", err);
    return res.status(500).json({ error: "Failed to load user profile" });
  }
});

app.put("/update-profile", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const { name, mobile, address, position, experience, companyName } = req.body;

    await db.collection("users").doc(uid).set(
      {
        name,
        mobile,
        address,
        position,
        experience,
        companyName: companyName ?? undefined,
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

app.get("/public/stats", async (req, res) => {
  try {
    const snap = await db.collection("users").get();
    const users = snap.docs.map(doc => doc.data());

    const companyCount = users.filter(u => u.role === "company").length;
    const jobSeekerCount = users.filter(u => u.role === "job-seeker").length;

    const jobSnap = await db.collection("jobs").get();
    const jobCount = jobSnap.size;

    return res.json({
      companyCount,
      jobSeekerCount,
      jobCount,
    });
  } catch (e) {
    console.error("Stats error:", e);
    res.status(500).json({ error: "Failed to load stats" });
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
    await createNotification(
      req.uid,
      "Meeting Request Submitted",
      "Your meeting request has been received",
      "meeting-requested",
      docRef.id
    );

    // Notify all admins
    adminSnapshot.docs.forEach(async d => {
      await createNotification(
        d.id,
        "New Meeting Request",
        `Meeting request from ${name} (${purpose})`,
        "meeting-request-received",
        docRef.id,
        "/admin/users",
      );
    });
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Meeting request error:", err);
    return res.status(500).json({ error: "Failed to submit meeting request" });
  }
});

app.get("/admin/companies/pending", verifyToken, loadUserRole, requireAdmin, async(req, res) => {
  const snap = await db.collection("companies")
      .where("status", "==", "pending")
      .get();

  return res.json({
    companies: snap.docs.map(d => ({ id: d.id, ...d.data() }))
  });
});

app.put("/admin/companies/:id/approve", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  const companyId = req.params.id;

  try {
    const companyRef = db.collection("companies").doc(companyId);
    const snap = await companyRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Company not found" });
    }

    const companyData = snap.data();
    const companyName = companyData.name;

    // 1️⃣ Mark as accepted
    await companyRef.update({
      status: "accepted",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2️⃣ Notify ALL USERS who belong to this company
    const employeesSnap = await db
      .collection("users")
      .where("companyId", "==", companyId)
      .get();

    for (const doc of employeesSnap.docs) {
      const userId = doc.id;

      await createNotification(
        userId,
        "Company Approved",
        `Your company '${companyName}' has been approved by the admin.`,
        "company-approved",
        companyId,
        "/profile"
      );
    }

    // 3️⃣ Notify Admin who approved
    await createNotification(
      req.uid,
      "Company Approved Successfully",
      `You approved '${companyName}'. All associated users have been notified.`,
      "company-approved-admin",
      companyId,
      "/admin/companies"
    );

    return res.json({ message: "Company approved & notifications sent" });

  } catch (err) {
    console.error("Company approval error:", err);
    return res.status(500).json({ error: "Failed to approve company" });
  }
});

app.put("/admin/companies/:id/reject", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyRef = db.collection("companies").doc(companyId);
    const snap = await companyRef.get();

    if (!snap.exists)
      return res.status(404).json({ error: "Company not found" });

    const companyData = snap.data();
    const companyName = companyData.name;

    // 1️⃣ Detach all users from company
    const usersSnap = await db.collection("users")
      .where("companyId", "==", companyId)
      .get();

    const batch = db.batch();

    for (const doc of usersSnap.docs) {
      const userId = doc.id;

      batch.update(doc.ref, {
        companyId: null,
        companyName: null,
        companyRole: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await createNotification(
        userId,
        "Company Rejected",
        `Your company '${companyName}' was rejected by admin.`,
        "company-rejected",
        companyId,
        "/profile"
      );
    }

    await batch.commit();

    // 2️⃣ Now safely delete company with ALL subcollections
    await firestore.recursiveDelete(companyRef);

    // 3️⃣ Notify admin
    await createNotification(
      req.uid,
      "Company Rejected Successfully",
      `You rejected '${companyName}'.`,
      "company-rejected-admin",
      companyId,
      "/admin/companies"
    );

    return res.json({
      message: "Company rejected and fully deleted"
    });

  } catch (error) {
    console.error("Company reject error:", error);
    return res.status(500).json({ error: "Failed to reject company" });
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

    const start_time = `${date}T${time}:00`; // 'YYYY-MM-DDTHH:mm:00'
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

    // Build JS Date for meeting start (Asia/Kolkata)
    const meetingStartJs = new Date(`${date}T${time}:00+05:30`);

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
      meetingStartAt: admin.firestore.Timestamp.fromDate(meetingStartJs),
      reminderSent: false,            // <--- for later reminder
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

    // Notification for requester (immediate)
    await createNotification(
      reqData.createdBy,
      "Meeting Approved",
      `Your meeting request for "${reqData.purpose}" was approved. Zoom link sent.`,
      "meeting-approved",
      meetingId,
      joinLink
    );

    // Notification for approving admin (immediate)
    await createNotification(
      req.uid,
      "Meeting Approved",
      `You approved meeting with ${reqData.name}. Zoom link sent.`,
      "meeting-approved-admin",
      meetingId,
      "admin/meetings"
    );

    scheduleMeetingReminder(meetingId, reqData, req.uid, meetingStartJs, joinLink);

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
    await createNotification(
      data.createdBy,
      `Your meeting was declined: ${reason || "No reason specified"}`,
      "meeting-declined",
      meetingId
    );

    // Notify declining admin
    await createNotification(
      req.uid,
      `Meeting request from ${data.name} was declined.`,
      "meeting-declined-admin",
      meetingId
    );
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

app.post("/jobs/create", verifyToken, loadUserRole, async (req, res) => {
  try {
    const uid = req.uid;

    if (req.user.role !== "recruiter" && req.user.role !== "company") {
      return res.status(403).json({ error: "Not allowed to create jobs" });
    }

    const { title, company, location, minSalary, maxSalary, type, workMode, description, category } = req.body;

    const newJob = {
      title,
      company,
      location,
      minSalary,
      maxSalary,
      type,
      workMode,
      description,
      category: category || null,
      postedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
      views: 0,
      savedBy: [],
      appliedBy: [],
    };

    const jobRef = await db.collection("jobs").add(newJob);

    return res.json({ success: true, id: jobRef.id });

  } catch (err) {
    console.error("Job creation error:", err);
    return res.status(500).json({ error: "Failed to create job" });
  }
});

app.put("/jobs/:id/view", async (req, res) => {
  try {
    const jobId = req.params.id;

    const jobRef = db.collection("jobs").doc(jobId);
    const snap = await jobRef.get();

    if (!snap.exists)
      return res.status(404).json({ error: "Job not found" });

    // Increment views safely
    await jobRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Job view error:", err);
    return res.status(500).json({ error: "Failed to increment view count" });
  }
});

app.get("/company/job-views/total", verifyToken, loadUserRole, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId)
      return res.json({ totalViews: 0 });

    const jobsSnap = await db
      .collection("jobs")
      .where("company", "==", req.user.companyName)
      .get();

    let totalViews = 0;
    jobsSnap.docs.forEach(doc => {
      totalViews += doc.data().views || 0;
    });

    return res.json({ totalViews });
  } catch (err) {
    console.error("Job views fetch error:", err);
    return res.status(500).json({ error: "Failed to load job views" });
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
        job.company?.toLowerCase().includes(r) ||
        job.category?.toLowerCase().includes(r)
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

    const { title, content } = req.body;

    const newBlog = {
      title,
      content,
      authorId: uid,
      authorName: user.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("blogs").add(newBlog);

    // Notify author
    await createNotification(
      uid,
      "Blog Published",
      `Your blog '${title}' was posted successfully!`,
      "blog-created",
      docRef.id
    );

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

app.put("/jobs/:id/edit", verifyToken, loadUserRole, async (req, res) => {
  try {
    const jobId = req.params.id;
    const uid = req.uid;

    const {
      title,
      description,
      company,
      location,
      minSalary,
      maxSalary,
      type,
      workMode,
      category
    } = req.body;

    const jobRef = db.collection("jobs").doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists)
      return res.status(404).json({ error: "Job not found" });

    const job = jobSnap.data();

    if (job.createdBy !== uid && req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ error: "Access denied — Not allowed to edit this job" });
    }

    const updatedFields = {
      title: title ?? job.title,
      description: description ?? job.description,
      company: company ?? job.company,
      location: location ?? job.location,
      minSalary: minSalary ?? job.minSalary,
      maxSalary: maxSalary ?? job.maxSalary,
      type: type ?? job.type,
      workMode: workMode ?? job.workMode,
      category: category ?? job.category,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await jobRef.update(updatedFields);

    // Notify job owner
    await createNotification(
      uid,
      "Job Updated",
      `Your job '${updatedFields.title}' has been updated.`,
      "job-updated",
      jobId
    );

    return res.json({
      message: "Job updated successfully",
      updated: updatedFields
    });

  } catch (err) {
    console.error("Job update error:", err);
    return res.status(500).json({ error: "Failed to update job" });
  }
});

app.delete("/jobs/:id", verifyToken, loadUserRole, async (req, res) => {
  try {
    const jobId = req.params.id;
    const uid = req.uid;

    // Fetch job
    const jobRef = db.collection("jobs").doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists)
      return res.status(404).json({ error: "Job not found" });

    const job = jobSnap.data();

    // Check ownership or admin override
    if (job.createdBy !== uid && req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ error: "Access denied — you cannot delete this job" });
    }

    // Delete job
    await jobRef.delete();

    // Notification to owner
    await createNotification(
      uid,
      "Job Deleted",
      `Your job '${job.title}' has been deleted.`,
      "job-deleted",
      jobId
    );

    return res.json({ message: "Job deleted successfully" });

  } catch (err) {
    console.error("Job deletion error:", err);
    return res.status(500).json({ error: "Failed to delete job" });
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

    if (!userId || !newRole) {
      return res.status(400).json({ error: "Missing userId or newRole" });
    }

    // 1️⃣ Fetch target user's document
    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const targetUser = userSnap.data();
    const username = targetUser.name || "User";

    // 2️⃣ Update user's role
    await db.collection("users").doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3️⃣ Notify affected user
    await createNotification(
      userId,
      "Role Updated",
      `Your role has been updated to '${newRole}'.`,
      "role-updated",
      userId,
      "/profile"
    );

    // 4️⃣ Notify the super-admin who did the change (with username)
    await createNotification(
      req.uid,
      "Role Update Executed",
      `${username}'s role has been changed to '${newRole}'.`,
      "role-updated-admin",
      userId,
      "/admin/users"
    );

    return res.json({ message: "Role updated" });

  } catch (err) {
    console.error("Role Update Error:", err);
    return res.status(500).json({ error: "Role update failed" });
  }
});

app.get("/notifications", verifyToken, async (req, res) => {
  try {
    const snap = await db
      .collection("notifications")
      .where("userId", "==", req.uid)
      .get();

    const notifications = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt
          ? data.createdAt.toMillis() // convert timestamp -> ms
          : null
      };
    });

    return res.json({ notifications });
  } catch (err) {
    console.error("Notification fetch error:", err);
    return res.status(500).json({ error: "Failed to load notifications" });
  }
});

app.put("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    await db.collection("notifications")
      .doc(req.params.id)
      .update({ status: "read" });

    return res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({ error: "Failed to mark read" });
  }
});

app.put("/notifications/read-all", verifyToken, async (req, res) => {
  try {
    const snap = await db.collection("notifications")
      .where("userId", "==", req.uid)
      .get();

    const batch = db.batch();

    snap.docs.forEach(doc => {
      batch.update(doc.ref, { status: "read" });
    });

    await batch.commit();
    return res.json({ success: true });
  } catch (err) {
    console.error("Mark all read error:", err);
    return res.status(500).json({ error: "Failed to mark all read" });
  }
});

app.get("/notifications/unread-count", verifyToken, async (req,res)=>{
  const snap = await db.collection("notifications")
      .where("userId","==",req.uid)
      .where("status","==","unread")
      .get();
  res.json({count: snap.size});
});

app.get("/companies", async (req, res) => {
  try {
    const snapshot = await db.collection("companies").get();

    const companies = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Count employees
      const employeesSnap = await db
        .collection("companies")
        .doc(doc.id)
        .collection("employees")
        .get();

      // Count open jobs
      const jobsSnap = await db
        .collection("jobs")
        .where("company", "==", data.name)
        .get();

      companies.push({
        id: doc.id,
        name: data.name || "",
        logo: data.logoUrl || null,
        industry: data.industry || null,
        location: data.address || null,
        employeeCount: employeesSnap.size || 0,
        openJobs: jobsSnap.size || 0,
        followers: data.followers || 0,
        website: data.website || null,
      });
    }

    res.json({ companies });

  } catch (err) {
    console.error("Companies fetch error:", err);
    res.status(500).json({ error: "Failed to load companies" });
  }
});

app.get("/company/:id", async (req, res) => {
  try {
    const companyId = req.params.id;

    // Get company main doc
    const companySnap = await db.collection("companies").doc(companyId).get();
    if (!companySnap.exists) {
      return res.status(404).json({ error: "Company not found" });
    }

    const company = { id: companySnap.id, ...companySnap.data() };

    // Count employees
    const employeesSnap = await db
      .collection("companies")
      .doc(companyId)
      .collection("employees")
      .get();

    // Count open jobs
    const jobsSnap = await db
      .collection("jobs")
      .where("company", "==", company.name)
      .get();

    res.json({
      company,
      employeesCount: employeesSnap.size,
      openJobs: jobsSnap.size,
    });
  } catch (err) {
    console.error("Company fetch error:", err);
    res.status(500).json({ error: "Server error fetching company" });
  }
});


app.post("/company/profile/create", verifyToken, loadUserRole, requireCompanyOwner, async (req, res) => {
  try {
    const { companyName, logoUrl, website, description } = req.body;

    if (!companyName) return res.status(400).json({ error: "Company name required" });

    const docRef = await db.collection("companies").add({
      name: companyName,
      logoUrl: logoUrl || null,
      website: website || null,
      description: description || "",
      ownerId: req.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, companyId: docRef.id });
  } catch (err) {
    console.error("Company create error:", err);
    return res.status(500).json({ error: "Failed to create company profile" });
  }
});

app.get("/company/users", verifyToken, loadUserRole, requireCompanyOwner, async (req, res) => {
  try {
    const companyUsersSnap = await db
      .collection("users")
      .where("companyId", "==", req.user.companyId)
      .get();

    const users = companyUsersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ users });
  } catch (err) {
    console.error("Company users fetch error:", err);
    return res.status(500).json({ error: "Failed to load employees" });
  }
});

app.put("/company/update-user-role",
  verifyToken, loadUserRole, requireCompanyOwner,
  async (req, res) => {
    try {
      const { userId, newRole } = req.body;

      if (!userId || !newRole)
        return res.status(400).json({ error: "Missing fields" });

      // Ensure the targeted user belongs to same company
      const targetSnap = await db.collection("users").doc(userId).get();
      if (!targetSnap.exists) return res.status(404).json({ error: "User not found" });

      const target = targetSnap.data();
      if (target.companyName !== req.user.companyName) {
        return res.status(403).json({ error: "You cannot modify someone outside your company" });
      }

      await db.collection("users").doc(userId).update({
        companyRole: newRole, // company-scoped role
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await createNotification(
        userId,
        "Company Role Updated",
        `Your company role has been changed to '${newRole}'.`,
        "company-role-updated"
      );

      return res.json({ success: true });
    } catch (err) {
      console.error("Company modify role error:", err);
      return res.status(500).json({ error: "Role change failed" });
    }
  }
);

app.put("/company/update", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const { name, address, description, logoUrl } = req.body;

    // 🔥 Find company where logged user is in owners array
    const companySnapshot = await db
      .collection("companies")
      .where("owners", "array-contains", uid)
      .limit(1)
      .get();

    if (companySnapshot.empty) {
      return res.status(404).json({ error: "No company found for this user OR user not owner" });
    }

    const companyRef = companySnapshot.docs[0].ref;

    // 🔐 Update company doc
    await companyRef.update({
      name: name?.trim(),
      address: address?.trim() || null,
      description: description?.trim() || null,
      logoUrl: logoUrl?.trim() || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // ⭐ Update all employees who have this companyId
    const employeesSnap = await db
      .collection("users")
      .where("companyId", "==", companyRef.id)
      .get();

    const batch = db.batch();

    employeesSnap.docs.forEach(doc => {
      batch.update(doc.ref, {
        companyName: name?.trim(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    res.status(200).json({
      message: "Company updated successfully",
      companyId: companyRef.id
    });

  } catch (error) {
    console.error("Company update failed:", error);
    res.status(500).json({ error: "Server error updating company" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));