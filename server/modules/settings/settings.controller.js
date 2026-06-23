import * as settingsService from "./settings.service.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await settingsService.getProfile(userId);

    res.json({
      message: "Profile loaded successfully",
      profile,
    });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(401).json({ message: "User not found" });
    }
    res.status(400).json({
      message: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { fullName, avatarUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await settingsService.updateProfile(userId, { fullName, avatarUrl });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { email, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await settingsService.updateAccount(userId, {
      email,
      currentPassword,
      newPassword,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const settings = await settingsService.getNotificationSettings(userId);

    res.json({
      message: "Notification settings loaded successfully",
      settings,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const settings = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await settingsService.updateNotificationSettings(userId, settings);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getAppearanceSettings = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const settings = await settingsService.getAppearanceSettings(userId);

    res.json({
      message: "Appearance settings loaded successfully",
      settings,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const updateAppearanceSettings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { theme } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await settingsService.updateAppearanceSettings(userId, { theme });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};