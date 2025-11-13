import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

    // ✅ Extract and log user data
    const { name, email, role, position, experience } = req.body;
    console.log("New User Data:", { name, email, role, position, experience });

    // ✅ You could store user info into database (e.g. Firestore, MongoDB, etc.)
    // For now just send response
    res.json({ message: "User registered successfully", firebaseUid: decoded.uid, data: req.body });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.post("/login", (req, res) => {
  res.json({ message: "Login successful", data: req.body });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
