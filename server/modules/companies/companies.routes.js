import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createCompany,
  joinCompany,
  requestJoinCompany,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getMembers,
  getDetail,
  changeMemberRole,
  removeMember,
  updateCompany,
  deleteCompany,
  refreshInviteCode,
  getStats,
} from "./companies.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createCompany);
router.post("/join", authMiddleware, joinCompany);
router.post("/request-join", authMiddleware, requestJoinCompany);

router.get("/:companyId/join-requests", authMiddleware, getJoinRequests);
router.put("/:companyId/join-requests/:requestId/approve", authMiddleware, approveJoinRequest);
router.put("/:companyId/join-requests/:requestId/reject", authMiddleware, rejectJoinRequest);

router.get("/:companyId", authMiddleware, getDetail);
router.put("/:companyId", authMiddleware, updateCompany);
router.delete("/:companyId", authMiddleware, deleteCompany);
router.post("/:companyId/refresh-invite", authMiddleware, refreshInviteCode);
router.get("/:companyId/stats", authMiddleware, getStats);

router.get("/:companyId/members", authMiddleware, getMembers);
router.put("/:companyId/members/:memberId/role", authMiddleware, changeMemberRole);
router.delete("/:companyId/members/:memberId", authMiddleware, removeMember);

export default router;
