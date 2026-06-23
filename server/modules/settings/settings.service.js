import prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateProfile = async (userId, data) => {
  const { fullName, avatarUrl } = data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName || null,
      avatarUrl: avatarUrl || null,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
    },
  });

  return {
    message: "Profile updated successfully",
    profile: user,
  };
};

export const updateAccount = async (userId, data) => {
  const { email, currentPassword, newPassword } = data;

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
      throw new Error("Invalid email format");
    }
  }

  if (newPassword) {
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    if (newPassword.length > 128) {
      throw new Error("New password must be at most 128 characters");
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error("New password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new Error("New password must contain at least one number");
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (newPassword) {
    if (!currentPassword) {
      throw new Error("Current password is required to change password");
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
  }

  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email is already in use");
    }
  }

  const updateData = {};

  if (email && email !== user.email) {
    updateData.email = email;
  }

  if (newPassword) {
    updateData.password = await hashPassword(newPassword);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
    },
  });

  return {
    message: "Account updated successfully",
    user: updatedUser,
  };
};

export const getNotificationSettings = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailNotifications: true,
      inAppNotifications: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateNotificationSettings = async (userId, settings) => {
  const { emailNotifications, inAppNotifications } = settings;

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailNotifications: emailNotifications ?? true,
      inAppNotifications: inAppNotifications ?? true,
    },
  });

  return {
    message: "Notification settings updated successfully",
  };
};

export const getAppearanceSettings = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      theme: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateAppearanceSettings = async (userId, settings) => {
  const { theme } = settings;

  const validThemes = ["light", "dark", "system"];
  if (theme && !validThemes.includes(theme)) {
    throw new Error("Invalid theme. Must be one of: light, dark, system");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      theme: theme || "light",
    },
  });

  return {
    message: "Appearance settings updated successfully",
  };
};