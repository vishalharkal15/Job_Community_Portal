import express from "express";
import { db } from "../config/firebase.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const snap = await db
      .collection("notifications")
      .where("userId", "==", req.uid)
      .get();

    const notifications = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt
          ? data.createdAt.toMillis() // convert timestamp -> ms
          : null
      };
    });

    return res.json({ notifications });
  } catch (err) {
    console.error("Notification fetch error:", err);
    return res.status(500).json({ error: "Failed to load notifications" });
  }
});

router.put("/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    await db.collection("notifications")
      .doc(req.params.id)
      .update({ status: "read" });

    return res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({ error: "Failed to mark read" });
  }
});

router.put("/notifications/read-all", verifyToken, async (req, res) => {
  try {
    const snap = await db.collection("notifications")
      .where("userId", "==", req.uid)
      .get();

    const batch = db.batch();

    snap.docs.forEach(doc => {
      batch.update(doc.ref, { status: "read" });
    });

    await batch.commit();
    return res.json({ success: true });
  } catch (err) {
    console.error("Mark all read error:", err);
    return res.status(500).json({ error: "Failed to mark all read" });
  }
});

router.get("/notifications/unread-count", verifyToken, async (req,res)=>{
  const snap = await db.collection("notifications")
      .where("userId","==",req.uid)
      .where("status","==","unread")
      .get();
  res.json({count: snap.size});
});

export default router;
