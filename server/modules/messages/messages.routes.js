import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getChannels,
  createChannel,
  getOrCreateDirectChannel,
  getChannelMessages,
  sendMessage,
  getRecentMessages,
  toggleReaction,
  getThreadMessages,
  deleteMessage,
  deleteChannel,
  markChannelAsRead,
} from "./messages.controller.js";

const router = express.Router();

router.get("/channels", authMiddleware, getChannels);
router.post("/channels", authMiddleware, createChannel);
router.post("/channels/direct", authMiddleware, getOrCreateDirectChannel);
router.get("/channels/:channelId/messages", authMiddleware, getChannelMessages);
router.post("/channels/:channelId/read", authMiddleware, markChannelAsRead);
router.post("/channels/:channelId/messages", authMiddleware, sendMessage);
router.get("/:messageId/thread", authMiddleware, getThreadMessages);
router.get("/", authMiddleware, getRecentMessages);
router.post("/:messageId/reactions", authMiddleware, toggleReaction);
router.delete("/:messageId", authMiddleware, deleteMessage);
router.delete("/channels/:channelId", authMiddleware, deleteChannel);

export default router;