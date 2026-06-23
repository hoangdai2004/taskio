import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/auth.routes.js";
import companyRoutes from "./modules/companies/companies.routes.js";
import onboardingRoutes from "./modules/onboarding/onboarding.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import messagesRoutes from "./modules/messages/messages.routes.js";
import calendarRoutes from "./modules/calendar/calendar.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import projectsRoutes from "./modules/projects/projects.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import uploadRoutes from "./modules/uploads/uploads.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";

const app = express();

app.use(helmet());

const clientOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
if (process.env.NODE_ENV === "production") {
  app.use(globalLimiter);
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
});
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth/signin", authLimiter);
  app.use("/api/auth/signup", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
}

app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;