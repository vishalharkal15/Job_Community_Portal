import express from "express";
import { db, admin } from "../config/firebase.js";
import { verifyToken } from "../middleware/auth.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

router.get("/blogs", async (req, res) => {
  try {
    const snapshot = await db.collection("blogs").orderBy("createdAt", "desc").get();

    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to load blogs" });
  }
});

router.post("/blogs", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized - No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Fetch user profile
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists)
      return res.status(404).json({ error: "User profile not found" });

    const user = userDoc.data();

    if (!["company", "recruiter", "admin", "super-admin"].includes(user.role)) {
      return res.status(403).json({ error: "You do not have access" });
    }

    const { title, content } = req.body;

    const newBlog = {
      title,
      content,
      authorId: uid,
      authorName: user.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("blogs").add(newBlog);

    // Notify author
    await createNotification(
      uid,
      "Blog Published",
      `Your blog '${title}' was posted successfully!`,
      "blog-created",
      docRef.id
    );

    return res.json({
      message: "Blog created successfully",
      id: docRef.id,
    });

  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const snap = await db.collection("blogs").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Blog not found" });

    const data = snap.data();

    res.json({
      blog: {
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load blog" });
  }
});

router.put("/blogs/:id/like", verifyToken, async (req, res) => {
  const ref = db.collection("blogs").doc(req.params.id);

  await ref.update({
    likes: admin.firestore.FieldValue.arrayUnion(req.uid),
    dislikes: admin.firestore.FieldValue.arrayRemove(req.uid),
  });

  res.json({ success: true });
});

router.put("/blogs/:id/dislike", verifyToken, async (req, res) => {
  const ref = db.collection("blogs").doc(req.params.id);

  await ref.update({
    dislikes: admin.firestore.FieldValue.arrayUnion(req.uid),
    likes: admin.firestore.FieldValue.arrayRemove(req.uid),
  });

  res.json({ success: true });
});

router.put("/blogs/:id/edit", verifyToken, async (req, res) => {
  const ref = db.collection("blogs").doc(req.params.id);
  const snap = await ref.get();

  if (!snap.exists) return res.status(404).json({ error: "Not found" });

  if (snap.data().authorId !== req.uid)
    return res.status(403).json({ error: "Not allowed" });

  await ref.update({
    ...req.body,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ success: true });
});

router.delete("/blogs/:id", verifyToken, async (req, res) => {
  const ref = db.collection("blogs").doc(req.params.id);
  const snap = await ref.get();

  if (!snap.exists) return res.status(404).json({ error: "Not found" });
  if (snap.data().authorId !== req.uid)
    return res.status(403).json({ error: "Not allowed" });

  await ref.delete();
  res.json({ success: true });
});

router.get("/blogs/:id/comments", async (req, res) => {
  const snap = await db
    .collection("blogs")
    .doc(req.params.id)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();

  res.json({
    comments: snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toMillis() || null
    }))
  });
});


router.post("/blogs/:id/comments", verifyToken, async (req, res) => {
  try {
    const userSnap = await db.collection("users").doc(req.uid).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userSnap.data();

    await db
      .collection("blogs")
      .doc(req.params.id)
      .collection("comments")
      .add({
        text: req.body.text,
        userId: req.uid,
        authorName: user.name || "User",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ success: true });

  } catch (err) {
    console.error("Post comment error:", err);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

export default router;