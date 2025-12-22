import { db } from "../config/firebase.js";

export const loadUserRole = async (req, res, next) => {
  try {
    const snap = await db.collection("users").doc(req.uid).get();

    if (!snap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = snap.data();

    req.user = {
      ...(req.user || {}),
      uid: req.uid,
      ...userData,
      role: userData.role || "user",
      companyId: userData.companyId || null,
      companyRole: userData.companyRole || null,
    };

    next();
  } catch (err) {
    console.error("loadUserRole error:", err);
    res.status(500).json({ error: "Failed to load user role" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!["admin", "super-admin"].includes(req.user.role))
    return res.status(403).json({ error: "Admin only" });
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super-admin")
    return res.status(403).json({ error: "Super Admin only" });
  next();
};

export const requireCompanyOwner = (req, res, next) => {
  if (req.user.companyRole !== "owner") {
    return res.status(403).json({
      error: "Only company owners can perform this action",
    });
  }
  next();
};