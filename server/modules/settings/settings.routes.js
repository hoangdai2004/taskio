import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  updateAccount,
  getNotificationSettings,
  updateNotificationSettings,
  getAppearanceSettings,
  updateAppearanceSettings,
} from "./settings.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.put("/account", authMiddleware, updateAccount);

router.get("/notifications", authMiddleware, getNotificationSettings);
router.put("/notifications", authMiddleware, updateNotificationSettings);

router.get("/appearance", authMiddleware, getAppearanceSettings);
router.put("/appearance", authMiddleware, updateAppearanceSettings);

export default router;