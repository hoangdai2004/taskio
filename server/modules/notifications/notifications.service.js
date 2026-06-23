import prisma from "../../config/prisma.js";

export const getNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return notifications;
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

  return {
    message: "Notification marked as read",
  };
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return {
    message: "All notifications marked as read",
  };
};

export const createNotification = async (userId, type, content) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { inAppNotifications: true }
  });

  if (user && user.inAppNotifications === false) {
    return;
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      content,
    },
  });
  
  if (global.io) {
    global.io.to(`user_${userId}`).emit("new_notification", notification);
  }
  
  return notification;
};

export const notifyTaskAssigned = async (taskId, assigneeId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (task && assigneeId) {
    await createNotification(
      assigneeId,
      "TASK_ASSIGNED",
      `You have been assigned to task "${task.title}" in ${task.project.name}`
    );
  }
};

export const notifyCommentAdded = async (taskId, commenterId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignee: true,
    },
  });

  if (task) {
    if (task.assigneeId && task.assigneeId !== commenterId) {
      await createNotification(
        task.assigneeId,
        "COMMENT",
        `New comment on task "${task.title}" in ${task.project.name}`
      );
    }
  }
};

export const notifyMention = async (userId, mentionerId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (task) {
    await createNotification(
      userId,
      "MENTION",
      `You were mentioned in task "${task.title}" in ${task.project.name}`
    );
  }
};

export const notifyDeadline = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (task) {
    await createNotification(
      userId,
      "DEADLINE",
      `Task "${task.title}" in ${task.project.name} is due soon`
    );
  }
};