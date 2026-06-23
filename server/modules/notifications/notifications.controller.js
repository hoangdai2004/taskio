import * as notificationsService from "./notifications.service.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await notificationsService.getNotifications(userId);
    res.json({
      message: "Notifications loaded successfully",
      notifications,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await notificationsService.markAsRead(userId, parseInt(notificationId));

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await notificationsService.markAllAsRead(userId);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};