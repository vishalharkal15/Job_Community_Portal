import express from "express";
import { db } from "../config/firebase.js";
import { verifyToken } from "../middleware/auth.js";
import { loadUserRole, requireAdmin, requireSuperAdmin } from "../middleware/roles.js";
import admin from "firebase-admin";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

router.get("/admin/users", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
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

router.get("/admin/jobs", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
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

router.get("/admin/blogs", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
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

router.put("/admin/update-role", verifyToken, loadUserRole, requireSuperAdmin, async (req, res) => {
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

router.get("/admin/companies/pending", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  const snap = await db.collection("companies")
      .where("status", "==", "pending")
      .get();

  return res.json({
    companies: snap.docs.map(d => ({ id: d.id, ...d.data() }))
  });
});

router.put("/admin/companies/:id/approve", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
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
      status: "approved",
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

router.put("/admin/companies/:id/reject", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  try {
    const companyId = req.params.id;
    const companyRef = db.collection("companies").doc(companyId);
    const snap = await companyRef.get();

    if (!snap.exists)
      return res.status(404).json({ error: "Company not found" });

    const companyData = snap.data();
    const companyName = companyData.name;

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

    await companyRef.delete();

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

export default router;