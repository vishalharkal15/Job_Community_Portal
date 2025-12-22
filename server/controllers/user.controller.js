import { db } from "../config/firebase.js";

export const getPublicUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userSnap = await db.collection("users").doc(userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userSnap.data();

    const profile = {
      id: userId,
      name: user.name || "Anonymous",
      position: user.position || null,
      experience: user.experience || null,
      gender: user.gender || null,
      createdAt: user.createdAt || null,
    };

    let company = null;
    if (user.companyId) {
      const companySnap = await db.collection("companies").doc(user.companyId).get();
      if (companySnap.exists) {
        const c = companySnap.data();
        company = {
          id: companySnap.id,
          name: c.name,
          logoUrl: c.logoUrl || null,
          status: c.status || "pending"
        };
      }
    }

    return res.json({ profile, company });

  } catch (err) {
    console.error("Public profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};