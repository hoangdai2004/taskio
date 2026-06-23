import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getProjects,
  getProjectDetail,
  createProject,
  joinProject,
  updateProject,
  deleteProject,
  updateTaskStatus,
  refreshInviteCode,
  addProjectMember,
} from "./projects.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getProjects);
router.post("/", authMiddleware, createProject);
router.post("/join", authMiddleware, joinProject);
router.get("/:projectId", authMiddleware, getProjectDetail);
router.put("/:projectId", authMiddleware, updateProject);
router.delete("/:projectId", authMiddleware, deleteProject);
router.post("/:projectId/refresh-invite", authMiddleware, refreshInviteCode);
router.post("/:projectId/members", authMiddleware, addProjectMember);

router.put("/:projectId/tasks/:taskId/status", authMiddleware, updateTaskStatus);

export default router;