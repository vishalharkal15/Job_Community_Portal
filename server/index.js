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

// 🔐 Only Super-Admin Access
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super-admin")
    return res.status(403).json({ error: "Access denied - Super Admin only" });

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
  