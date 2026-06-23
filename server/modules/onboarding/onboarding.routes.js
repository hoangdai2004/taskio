import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createCompany, getStatus } from "./onboarding.controller.js";

const router = express.Router();

router.post("/create-company", authMiddleware, createCompany);
router.get("/status", authMiddleware, getStatus);

export default router;
