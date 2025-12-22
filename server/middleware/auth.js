import { admin } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const verifyTokenOptional = async (req, _, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return next();

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
  } catch {}
  next();
};