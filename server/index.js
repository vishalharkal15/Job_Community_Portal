import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const serviceAccount = JSON.parse(
    fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
  );  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
