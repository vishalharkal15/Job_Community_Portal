import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load Firebase service account file in ESM style
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

// ✅ Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
