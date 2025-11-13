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

app.post("/register", (req, res) => {
  res.json({ message: "User registered successfully", data: req.body });
});

app.post("/login", (req, res) => {
  res.json({ message: "Login successful", data: req.body });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
