import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "./notifications.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/:notificationId/read", authMiddleware, markAsRead);
router.put("/read-all", authMiddleware, markAllAsRead);

export default router;