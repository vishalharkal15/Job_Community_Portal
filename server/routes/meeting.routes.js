import express from "express";
import nodemailer from "nodemailer";
import axios from "axios";
import { db, admin } from "../config/firebase.js";
import { verifyToken } from "../middleware/auth.js";
import { loadUserRole, requireAdmin } from "../middleware/roles.js";
import { generateZoomToken } from "../utils/zoom.js";
import { createNotification } from "../utils/notifications.js";

const router = express.Router();

router.post("/create-meeting", async (req, res) => {
  try {
    const { name, email, date, time, purpose } = req.body;

    const token = await generateZoomToken();

    const meetingData = {
      topic: purpose,
      type: 2,
      start_time: `${date}T${time}:00`,
      duration: 30,
      timezone: "Asia/Kolkata",
      settings: {
        host_video: true,
        participant_video: true
      }
    };

    const zoomRes = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const joinLink = zoomRes.data.join_url;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Zoom Meeting Scheduled",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your meeting has been scheduled.</p>
        <p><b>Join Zoom Meeting:</b></p>
        <a href="${joinLink}" style="color:blue">${joinLink}</a>
      `
    });

    res.json({
      success: true,
      link: joinLink,
      message: "Zoom meeting created & email sent!"
    });

  } catch (error) {
    console.error("Zoom Error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to create Zoom meeting" });
  }
});

router.post("/meeting-request", verifyToken, loadUserRole, async (req, res) => {
  try {
    const { name, email, phone, purpose, message } = req.body;

    // Save request in Firestore
    const docRef = await db.collection("meeting_requests").add({
      name,
      email,
      phone,
      purpose,
      message: message || "",
      status: "pending",
      createdBy: req.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Find admin emails
    const adminSnapshot = await db.collection("users")
      .where("role", "in", ["admin", "super-admin"])
      .get();

    const adminEmails = adminSnapshot.docs
      .map(d => d.data()?.email)
      .filter(Boolean);

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    // Email admins (if any)
    if (adminEmails.length > 0) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: adminEmails, // array works with nodemailer
        subject: "New Meeting Request — Action Required",
        html: `
          <h3>New Meeting Request</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Purpose:</b> ${purpose}</p>
          <p><b>Message:</b> ${message || "—"}</p>
          <p>Approve or decline this request in the admin panel.</p>
        `,
      });
    } else {
      console.log("No admins found to notify.");
    }

    // Confirmation email to requester
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "We received your meeting request",
      html: `
        <h3>Thanks for your anticipation</h3>
        <p>We have received your request for a meeting regarding <b>${purpose}</b>.</p>
        <p>We will respond to you about the date and time soon. Stay tuned!</p>
      `,
    });
    await createNotification(
      req.uid,
      "Meeting Request Submitted",
      "Your meeting request has been received",
      "meeting-requested",
      docRef.id
    );

    // Notify all admins
    adminSnapshot.docs.forEach(async d => {
      await createNotification(
        d.id,
        "New Meeting Request",
        `Meeting request from ${name} (${purpose})`,
        "meeting-request-received",
        docRef.id,
        "/admin/users",
      );
    });
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Meeting request error:", err);
    return res.status(500).json({ error: "Failed to submit meeting request" });
  }
});

router.get("/admin/meetings", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = db.collection("meeting_requests").orderBy("createdAt", "desc");

    if (status) query = query.where("status", "==", status);

    const snap = await query.get();
    const meetings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ meetings });
  } catch (err) {
    console.error("Admin meetings error:", err);
    return res.status(500).json({ error: "Failed to fetch meeting requests" });
  }
});

router.put("/admin/meetings/:id/approve", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  const meetingId = req.params.id;
  const { date, time, durationMinutes = 30 } = req.body;

  if (!date || !time) return res.status(400).json({ error: "Missing date or time" });

  try {
    // Fetch meeting request doc
    const reqDocRef = db.collection("meeting_requests").doc(meetingId);
    const reqDoc = await reqDocRef.get();
    if (!reqDoc.exists) return res.status(404).json({ error: "Meeting request not found" });

    const reqData = reqDoc.data();

    // Create Zoom meeting
    const token = await generateZoomToken();

    const start_time = `${date}T${time}:00`; // 'YYYY-MM-DDTHH:mm:00'
    const meetingPayload = {
      topic: `Meeting: ${reqData.purpose} — ${reqData.name}`,
      type: 2,
      start_time,
      duration: durationMinutes,
      timezone: "Asia/Kolkata",
      settings: {
        host_video: true,
        participant_video: true,
      },
    };

    const zoomRes = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const joinLink = zoomRes.data.join_url;
    const meetingZoomId = zoomRes.data.id;

    // Build JS Date for meeting start (Asia/Kolkata)
    const meetingStartJs = new Date(`${date}T${time}:00+05:30`);

    // Update Firestore
    await reqDocRef.update({
      status: "approved",
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: req.uid,
      scheduledDate: date,
      scheduledTime: time,
      durationMinutes,
      zoomLink: joinLink,
      zoomId: meetingZoomId,
      meetingStartAt: admin.firestore.Timestamp.fromDate(meetingStartJs),
      reminderSent: false,            // <--- for later reminder
    });
    
    // Notify requester via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    const htmlForUser = `
      <h3>Your meeting has been scheduled</h3>
      <p>Hi ${reqData.name},</p>
      <p>Your meeting for <b>${reqData.purpose}</b> has been scheduled.</p>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${time}</p>
      <p><b>Duration:</b> ${durationMinutes} minutes</p>
      <p><b>Join Zoom Meeting:</b> <a href="${joinLink}">${joinLink}</a></p>
      <p>See you then.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: reqData.email,
      subject: "Your meeting is scheduled",
      html: htmlForUser,
    });

    // Notification for requester (immediate)
    await createNotification(
      reqData.createdBy,
      "Meeting Approved",
      `Your meeting request for "${reqData.purpose}" was approved. Zoom link sent.`,
      "meeting-approved",
      meetingId,
      joinLink
    );

    // Notification for approving admin (immediate)
    await createNotification(
      req.uid,
      "Meeting Approved",
      `You approved meeting with ${reqData.name}. Zoom link sent.`,
      "meeting-approved-admin",
      meetingId,
      "admin/meetings"
    );

    scheduleMeetingReminder(meetingId, reqData, req.uid, meetingStartJs, joinLink);

    return res.json({ success: true, zoomLink: joinLink, meetingId: meetingZoomId });
  } catch (err) {
    console.error("Approve meeting error:", err.response?.data || err);
    return res.status(500).json({ error: "Failed to approve and schedule meeting" });
  }
});

router.put("/admin/meetings/:id/decline", verifyToken, loadUserRole, requireAdmin, async (req, res) => {
  const meetingId = req.params.id;
  const { reason } = req.body;

  try {
    const ref = db.collection("meeting_requests").doc(meetingId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });

    const data = snap.data();

    await ref.update({
      status: "declined",
      declinedAt: admin.firestore.FieldValue.serverTimestamp(),
      declinedBy: req.uid,
      declineReason: reason || ""
    });

    // send email to requester
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: data.email,
      subject: "Meeting Request Declined",
      html: `
        <h3>Your meeting request was declined</h3>
        <p>Reason: ${reason || "No reason provided"}</p>
      `,
    });
    await createNotification(
      data.createdBy,
      `Your meeting was declined: ${reason || "No reason specified"}`,
      "meeting-declined",
      meetingId
    );

    // Notify declining admin
    await createNotification(
      req.uid,
      `Meeting request from ${data.name} was declined.`,
      "meeting-declined-admin",
      meetingId
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("Decline error:", err);
    return res.status(500).json({ error: "Failed to decline" });
  }
});

export default router;