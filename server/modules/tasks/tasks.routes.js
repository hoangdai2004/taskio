import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getTasks,
  getTaskDetail,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  assignTask,
  bulkDeleteTasks,
} from "./tasks.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.delete("/bulk", authMiddleware, bulkDeleteTasks);
router.get("/:taskId", authMiddleware, getTaskDetail);
router.put("/:taskId", authMiddleware, updateTask);
router.delete("/:taskId", authMiddleware, deleteTask);

router.post("/:taskId/comments", authMiddleware, addComment);

router.post("/:taskId/assign", authMiddleware, assignTask);

export default router;
