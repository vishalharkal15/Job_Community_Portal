import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Initialize Firebase Admin
let db;
try {
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("✅ Firebase Admin initialized successfully");
  } else {
    console.warn("⚠️  serviceAccountKey.json not found. Using environment variables...");
    
    // Initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "jobcommunityportal",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    db = admin.firestore();
    console.log("✅ Firebase Admin initialized with environment variables");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  console.log("⚠️  Server will run but Firebase operations will fail");
}

app.get("/", (req, res) => {
  res.send("Server running successfully!");
});

app.post("/register", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    // ✅ Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    console.log("✅ Firebase user verified:", uid);

    // ✅ Receive data from frontend (including file URLs)
    const { 
      name, 
      email, 
      mobile, 
      address, 
      role, 
      position, 
      experience, 
      cvUrl, 
      certificatesUrl 
    } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing required fields: name, email, role" });
    }

    console.log("📝 Saving user data:", { name, email, role, position, experience });
    console.log("📎 File URLs:", { cvUrl, certificatesUrl });
    
    // ✅ Save in Firestore (NO file handling - just URLs)
    await db.collection("users").doc(uid).set(
      {
        name,
        email,
        mobile: mobile || null,
        address: address || null,
        role,
        position: position || null,
        experience: experience || null,
        cvUrl: cvUrl || null,
        certificatesUrl: certificatesUrl || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ User data saved to Firestore successfully");

    res.json({ 
      message: "User registered & saved in Firestore successfully",
      firebaseUid: uid,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error saving user:", error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: "Invalid token format" });
    }
    
    res.status(500).json({ error: "Server error while saving user data" });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
