import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getCalendarEvents,
  getTodayEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./calendar.controller.js";

const router = express.Router();

router.get("/events", authMiddleware, getCalendarEvents);
router.get("/today", authMiddleware, getTodayEvents);
router.post("/events", authMiddleware, createEvent);
router.put("/events/:eventId", authMiddleware, updateEvent);
router.delete("/events/:eventId", authMiddleware, deleteEvent);

export default router;