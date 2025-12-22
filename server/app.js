import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import meetingRoutes from "./routes/meeting.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE,OPTIONS" }));
app.use(express.json());

app.get("/", (_, res) => res.send("Server running successfully!"));

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", companyRoutes);
app.use("/", jobRoutes);
app.use("/", blogRoutes);
app.use("/", meetingRoutes);
app.use("/", adminRoutes);
app.use("/", notificationRoutes);
app.use("/", applicationsRoutes);

export default app;