import express from "express";
import { db, admin } from "../config/firebase.js";
import { verifyToken } from "../middleware/auth.js";
import { loadUserRole } from "../middleware/roles.js";
import { getPublicUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/user/profile", verifyToken, loadUserRole, async (req, res) => {
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

router.put("/update-profile", async (req, res) => {
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

router.get("/public/stats", async (req, res) => {
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

router.get("/me/company", verifyToken, loadUserRole, async (req, res) => {
  if (!req.user.companyId)
    return res.status(404).json({ error: "No company linked" });

  const snap = await db.collection("companies").doc(req.user.companyId).get();
  if (!snap.exists) return res.status(404).json({ error: "Company not found" });

  res.json(snap.data());
});

router.get("/users/:userId/profile", getPublicUserProfile);

export default router;
