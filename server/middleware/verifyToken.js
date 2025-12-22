import admin from "firebase-admin";

export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    req.uid = decoded.uid;
    req.user = decoded; // firebase user payload
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};
