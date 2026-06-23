import prisma from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { sendPasswordResetCode } from "../../utils/email.service.js";

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (password.length > 128) {
    throw new Error("Password must be at most 128 characters");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain at least one number");
  }
};

const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 255) {
    throw new Error("Invalid email format");
  }
};

export const register = async (data) => {
  const { email, password, fullName } = data;

  validateEmail(email);
  validatePassword(password);

  if (fullName && (typeof fullName !== "string" || fullName.length > 100)) {
    throw new Error("Full name must be at most 100 characters");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashed = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      fullName: fullName || null,
    },
  });

  return { message: "User registered successfully" };
};

export const login = async (data) => {
  const { email, password, rememberMe = false } = data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : "7d",
  });

  const companies = user.memberships.map((m) => ({
    id: m.company.id,
    name: m.company.name,
    slug: m.company.slug,
    role: m.role,
  }));

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      activeCompanyId: user.activeCompanyId,
      companies,
    },
  };
};

export const googleLoginMock = async (data) => {
  const { email, fullName, avatarUrl } = data;
  if (!email) throw new Error("Email is required for Google Login");

  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { company: true },
      },
    },
  });

  if (!user) {
    // create user with random password since it's OAuth
    const randomPassword = await hashPassword(Math.random().toString(36).slice(-10) + "A1!");
    user = await prisma.user.create({
      data: {
        email,
        fullName: fullName || email.split("@")[0],
        avatarUrl,
        password: randomPassword,
      },
      include: {
        memberships: {
          include: { company: true },
        },
      },
    });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const companies = user.memberships.map((m) => ({
    id: m.company.id,
    name: m.company.name,
    slug: m.company.slug,
    role: m.role,
  }));

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      activeCompanyId: user.activeCompanyId,
      companies,
    },
  };
};

export const forgotPassword = async (data) => {
  const { email } = data;

  if (!email) {
    throw new Error("Email is required");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      message: "If the email exists, a password reset code has been sent.",
    };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.passwordResetToken.deleteMany({
    where: { email }
  });

  await prisma.passwordResetToken.create({
    data: {
      email,
      token: code,
      userId: user.id,
      expiresAt,
    }
  });

  try {
    await sendPasswordResetCode(email, code);
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
  }

  return {
    message: "If the email exists, a password reset code has been sent.",
    ...(process.env.NODE_ENV !== "production" && { code }),
  };
};

export const resetPassword = async (data) => {
  const { email, code, password } = data;

  if (!email || !code || !password) {
    throw new Error("Email, code and password are required");
  }

  validatePassword(password);

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      token: code,
    }
  });

  if (!resetRecord) {
    throw new Error("Invalid verification code or email does not match.");
  }

  if (new Date() > resetRecord.expiresAt) {
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id }
    });
    throw new Error("Verification code has expired.");
  }

  const hashed = await hashPassword(password);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: {
      password: hashed,
    },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetRecord.id }
  });

  return {
    message: "Password has been reset successfully.",
  };
};

export const getUserCompanies = async (userId) => {
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
    throw new Error("User not found");
  }

  return user.memberships.map((m) => ({
    id: m.company.id,
    name: m.company.name,
    slug: m.company.slug,
    role: m.role,
  }));
};

export const setActiveCompany = async (userId, companyId) => {
  if (!companyId) {
    throw new Error("Company ID is required");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this company");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      activeCompanyId: companyId,
    },
  });

  return {
    message: "Active company set successfully",
    activeCompanyId: user.activeCompanyId,
  };
};