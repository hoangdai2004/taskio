import * as authService from "./auth.service.js";
import prisma from "../../config/prisma.js";

export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (err) {
    const status =
      err.message === "Email already exists" ? 409 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    const { token, user } = result;
    const rememberMe = req.body.rememberMe;

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    };

    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    res.cookie("token", token, cookieOptions);
    res.json({
      message: "Signed in successfully",
      user,
    });
  } catch (err) {
    const status =
      err.message === "Invalid credentials" ? 401 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email, fullName, avatarUrl } = req.body;
    const result = await authService.googleLoginMock({ email, fullName, avatarUrl });
    const { token, user } = result;

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    res.cookie("token", token, cookieOptions);
    res.json({
      message: "Signed in with Google successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const signOut = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.json({ message: "Signed out successfully" });
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let activeCompanyId = user.activeCompanyId;
    const isMember = user.memberships.some((m) => m.company.id === activeCompanyId);
    
    if (!isMember) {
      activeCompanyId = user.memberships.length > 0 ? user.memberships[0].company.id : null;
      if (activeCompanyId !== user.activeCompanyId) {
        await prisma.user.update({
          where: { id: userId },
          data: { activeCompanyId }
        });
      }
    }

    const companies = user.memberships.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      slug: m.company.slug,
      role: m.role,
    }));

    res.json({
      message: "User loaded successfully",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        activeCompanyId: activeCompanyId,
        companies,
      },
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const companies = await authService.getUserCompanies(userId);
    res.json({
      message: "Companies loaded successfully",
      companies,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const setActiveCompany = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await authService.setActiveCompany(userId, companyId);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};