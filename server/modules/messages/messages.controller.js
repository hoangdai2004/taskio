import * as messagesService from "./messages.service.js";
import prisma from "../../config/prisma.js";

export const getChannels = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const channels = await messagesService.getChannels(userId, parseInt(companyId));

    res.json({
      message: "Channels loaded successfully",
      channels,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const createChannel = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { name, projectId, memberIds } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await messagesService.createChannel(
      userId,
      parseInt(companyId),
      { name, projectId, memberIds }
    );

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getOrCreateDirectChannel = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ message: "userId and targetUserId are required" });
    }

    const channel = await messagesService.getOrCreateDirectChannel(
      userId,
      parseInt(companyId),
      parseInt(targetUserId)
    );

    res.json({ message: "Channel found or created", channel });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { channelId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const messages = await messagesService.getChannelMessages(
      userId,
      parseInt(companyId),
      parseInt(channelId)
    );

    res.json({
      message: "Messages loaded successfully",
      messages,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 404;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { channelId } = req.params;
    const { content, parentId, attachments } = req.body;
    console.log(`[DEBUG] sendMessage request: user=${userId}, channel=${channelId}, content=${content?.substring(0, 20)}`);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await messagesService.sendMessage(
      userId,
      parseInt(companyId),
      parseInt(channelId),
      content,
      parentId,
      attachments
    );

    const io = req.app.get("io");
    if (io) {
      console.log(`[DEBUG] Emitting new_message to channel_${channelId}`);
      io.to(`channel_${channelId}`).emit("new_message", result.data);
      
      const members = await prisma.channelMember.findMany({
        where: { channelId: parseInt(channelId) },
        select: { userId: true }
      });
      members.forEach(member => {
        io.to(`user_${member.userId}`).emit("new_message", result.data);
      });
    } else {
      console.log("[DEBUG] No io instance found in req.app");
    }

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getRecentMessages = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await messagesService.getRecentMessages(userId);

    res.json({
      message: "Recent messages loaded successfully",
      messages,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
export const toggleReaction = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const result = await messagesService.toggleReaction(
      userId,
      parseInt(messageId),
      emoji
    );

    const io = req.app.get("io");
    if (io) {
      const message = await prisma.message.findUnique({
        where: { id: parseInt(messageId) },
        select: { channelId: true }
      });
      
      if (message) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
        io.to(`channel_${message.channelId}`).emit("reaction_update", {
          messageId: parseInt(messageId),
          emoji,
          userId,
          action: result.action,
          fullName: user?.fullName || "User"
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getThreadMessages = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const thread = await messagesService.getThreadMessages(
      userId,
      parseInt(companyId),
      parseInt(messageId)
    );

    res.json({
      message: "Thread loaded successfully",
      thread,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
export const markChannelAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { channelId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!channelId) return res.status(400).json({ message: "Channel ID required" });

    const result = await messagesService.markChannelAsRead(userId, parseInt(channelId));
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await messagesService.deleteMessage(userId, parseInt(messageId));

    const io = req.app.get("io");
    if (io) {
      io.to(`channel_${result.channelId}`).emit("message_deleted", {
        messageId: parseInt(messageId),
        channelId: result.channelId,
        parentId: result.parentId,
      });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { channelId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await messagesService.deleteChannel(userId, parseInt(channelId));

    const io = req.app.get("io");
    if (io) {
      io.to(`channel_${channelId}`).emit("channel_deleted", { channelId: parseInt(channelId) });
    }

    res.json({ message: "Channel deleted successfully" });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};
