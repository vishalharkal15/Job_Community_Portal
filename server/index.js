import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = admin.firestore();

// ✅ Load Firebase service account file in ESM style (if it exists)
try {
  const serviceAccount = JSON.parse(
    fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
  );
  
  // ✅ Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.warn("⚠️  Firebase Admin not initialized (serviceAccountKey.json not found)");
  console.warn("   Server will run without Firebase Admin features");
}

// ✅ Example routes
app.get("/", (req, res) => {
  res.send("Server running successfully!");
});

app.post("/register", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - No token provided" });

  try {
    // ✅ Verify token from Firebase Auth
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("Decoded Firebase user:", decoded);
    const uid = decoded.uid;

    // ✅ Extract and log user data
    const { name, email, role, position, experience } = req.body;
    console.log("New User Data:", { name, email, role, position, experience });

    await db.collection("users").doc(uid).set({
      uid,
      name,
      email,
      mobile,
      address,
      role,
      position,
      experience,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ 
      message: "User registered & saved in Firestore successfully",
      firebaseUid: uid 
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(401).json({ error: "Server error" });
  }
});

app.post("/login", (req, res) => {
  res.json({ message: "Login successful", data: req.body });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
