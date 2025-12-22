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

/**
 * UPDATE APPLICATION STATUS (DRAG & DROP)
 */
router.put(
  "/applications/:id/status",
  verifyToken,
  loadUserRole,
  requireCompanyOwner,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status required" });
      }

      await db.collection("applications").doc(req.params.id).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Update status error:", err);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

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