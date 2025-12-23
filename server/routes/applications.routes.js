import express from "express";
import { db, admin } from "../config/firebase.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { loadUserRole, requireCompanyOwner } from "../middleware/roles.js";

const router = express.Router();

/**
 * GET COMPANY APPLICATIONS (PIPELINE)
 */
router.get(
  "/applications/company/:companyId",
  verifyToken,
  loadUserRole,
  requireCompanyOwner,
  async (req, res) => {
    try {
      const { companyId } = req.params;

      // 🔒 extra safety
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const snap = await db
        .collection("applications")
        .where("companyId", "==", companyId)
        .where("archived", "==", false)
        .get();

      const applications = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ applications });
    } catch (err) {
      console.error("Load applications error:", err);
      res.status(500).json({ error: "Failed to load applications" });
    }
  }
);

router.put("/applications/:id/status", verifyToken, loadUserRole, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUSES = [
      "Applied",
      "Shortlisted",
      "Interview Scheduled",
      "In Review",
      "Rejected",
      "Hired",
    ];

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appRef = db.collection("applications").doc(id);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ error: "Application not found" });
    }

    const app = appSnap.data();

    if (req.user.companyId !== app.companyId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // update status
    await appRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // archive when terminal
    if (status === "Rejected" || status === "Hired") {
      await appRef.update({ archived: true });
    }

    // handle hired safely
    if (status === "Hired") {
      const empRef = db
        .collection("companies")
        .doc(app.companyId)
        .collection("employees")
        .doc(app.applicantId);

      const empSnap = await empRef.get();

      if (!empSnap.exists) {
        await empRef.set({
          name: app.applicantName,
          email: app.applicantEmail,
          companyRole: "employee",
          position: app.jobTitle,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await db.collection("users").doc(app.applicantId).update({
          companyId: app.companyId,
          companyName: app.companyName,
          companyRole: "employee",
          position: app.jobTitle,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // notify applicant
    await db.collection("notifications").add({
      userId: app.applicantId,
      title: "Application Status Updated",
      message: `Your application for "${app.jobTitle}" is now "${status}".`,
      type: "application-status",
      metadata: {
        applicationId: id,
        companyId: app.companyId,
        jobId: app.jobId,
        status,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Update application status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
});

router.put(
  "/applications/:id/withdraw",
  verifyToken,
  async (req, res) => {
    try {
      const appRef = db.collection("applications").doc(req.params.id);
      const snap = await appRef.get();

      if (!snap.exists) {
        return res.status(404).json({ error: "Application not found" });
      }

      const app = snap.data();

      // 🔒 Only applicant can withdraw
      if (app.applicantId !== req.uid) {
        return res.status(403).json({ error: "Not allowed" });
      }

      await appRef.update({
        status: "Withdrawn",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Withdraw error:", err);
      res.status(500).json({ error: "Failed to withdraw" });
    }
  }
);

export default router;