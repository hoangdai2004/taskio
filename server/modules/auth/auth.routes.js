import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  register,
  login,
  googleLogin,
  signOut,
  forgotPassword,
  resetPassword,
  me,
  getCompanies,
  setActiveCompany,
} from "./auth.controller.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.post("/google", googleLogin);
router.post("/signout", signOut);
router.get("/me", authMiddleware, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/companies", authMiddleware, getCompanies);
router.post("/set-active-company", authMiddleware, setActiveCompany);

export default router;