import prisma from "../../config/prisma.js";

export const getChannels = async (userId, companyId) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: Number(userId),
        companyId: Number(companyId),
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this company");
  }

  const channels = await prisma.channel.findMany({
    where: {
      companyId: Number(companyId),
      OR: [
        {
          members: {
            some: {
              userId: Number(userId),
            },
          },
        },
        {
          project: {
            memberships: {
              some: {
                userId: Number(userId),
              },
            },
          },
        },
      ],
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: Number(userId) },
              seenBy: { none: { userId: Number(userId) } }
            }
          }
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const uniqueDirectChannels = new Map();

  const filteredChannels = channels.filter((channel) => {
    if (channel.projectId) return true;

    // For direct channels, keep only the newest one per unique set of members
    const memberIds = channel.members.map((m) => m.userId).sort().join(",");
    if (uniqueDirectChannels.has(memberIds)) {
      return false;
    }
    uniqueDirectChannels.set(memberIds, true);
    return true;
  });

  return filteredChannels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.projectId ? "project" : "direct",
    project: channel.project,
    members: channel.members.map((m) => m.user),
    messageCount: channel._count.messages,
    unreadCount: channel._count.messages,
    createdAt: channel.createdAt,
    lastMessage: channel.messages[0] || null,
  }));
};

export const createChannel = async (userId, companyId, data) => {
  const { name, projectId, memberIds } = data;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: Number(userId),
        companyId: Number(companyId),
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this company");
  }

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        companyId: Number(companyId),
      },
    });

    if (!project) {
      throw new Error("Project not found or does not belong to this company");
    }
  }

  let channelMembers = [];
  if (memberIds && memberIds.length > 0) {
    const members = await prisma.membership.findMany({
      where: {
        companyId,
        userId: {
          in: memberIds,
        },
      },
    });

    if (members.length !== memberIds.length) {
      throw new Error("Some users are not members of this company");
    }

    channelMembers = memberIds.map((id) => ({ userId: id }));
    if (!channelMembers.some((m) => m.userId === userId)) {
      channelMembers.push({ userId });
    }
  } else if (!projectId) {
    channelMembers = [{ userId }];
  }

  const channel = await prisma.channel.create({
    data: {
      name: name || "Direct Message",
      companyId: Number(companyId),
      projectId: projectId ? Number(projectId) : null,
      members: {
        create: channelMembers.map(m => ({ userId: Number(m.userId) })),
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return {
    message: "Channel created successfully",
    channel: {
      id: channel.id,
      name: channel.name,
      type: channel.projectId ? "project" : "direct",
      project: channel.project,
      members: channel.members.map((m) => m.user),
      createdAt: channel.createdAt,
    },
  };
};

export const getOrCreateDirectChannel = async (userId, companyId, targetUserId) => {
  if (Number(userId) === Number(targetUserId)) {
    throw new Error("Cannot create a direct channel with yourself");
  }

  // Find existing direct channels the user is in
  const existingChannels = await prisma.channel.findMany({
    where: {
      companyId: Number(companyId),
      type: "DIRECT",
      members: {
        some: {
          userId: Number(userId)
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true }
          }
        }
      }
    }
  });

  // Filter precisely to ensure only these 2 members exist and one is the target
  const directChannel = existingChannels.find(c => 
    c.members.length === 2 && 
    c.members.some(m => m.userId === Number(userId)) && 
    c.members.some(m => m.userId === Number(targetUserId))
  );

  if (directChannel) {
    return {
      id: directChannel.id,
      name: directChannel.name,
      type: "direct",
      members: directChannel.members.map(m => m.user)
    };
  }

  // Create new direct channel
  const targetUser = await prisma.user.findUnique({ where: { id: Number(targetUserId) } });
  const currentUser = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!targetUser || !currentUser) {
    throw new Error("User not found");
  }

  const channel = await prisma.channel.create({
    data: {
      name: `${currentUser.fullName || 'User'}, ${targetUser.fullName || 'User'}`,
      type: "DIRECT",
      companyId: Number(companyId),
      members: {
        create: [
          { userId: Number(userId) },
          { userId: Number(targetUserId) }
        ]
      }
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } }
        }
      }
    }
  });

  return {
    id: channel.id,
    name: channel.name,
    type: "direct",
    members: channel.members.map(m => m.user)
  };
};

export const getChannelMessages = async (userId, companyId, channelId) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: Number(userId),
        companyId: Number(companyId),
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this company");
  }

  const channel = await prisma.channel.findFirst({
    where: {
      id: Number(channelId),
      companyId: Number(companyId),
    },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  let channelMember = await prisma.channelMember.findUnique({
    where: {
      channelId_userId: {
        channelId: Number(channelId),
        userId: Number(userId),
      },
    },
  });

  if (!channelMember && channel.projectId) {
    const projectMember = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: {
          userId: Number(userId),
          projectId: channel.projectId,
        },
      },
    });

    if (projectMember) {
      channelMember = await prisma.channelMember.create({
        data: {
          channelId,
          userId,
        },
      });
    }
  }

  if (!channelMember) {
    throw new Error("You are not a member of this channel");
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId: Number(channelId),
      parentId: null,
    },
    include: {
      _count: {
        select: {
          replies: true,
        },
      },
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
};

export const sendMessage = async (userId, companyId, channelId, content, parentId = null, attachments = null) => {
  if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) {
    throw new Error("Message content or attachment is required");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: Number(userId),
        companyId: Number(companyId),
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this company");
  }

  const channel = await prisma.channel.findFirst({
    where: {
      id: Number(channelId),
      companyId: Number(companyId),
    },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  const channelMember = await prisma.channelMember.findUnique({
    where: {
      channelId_userId: {
        channelId: Number(channelId),
        userId: Number(userId),
      },
    },
  });

  if (!channelMember) {
    throw new Error("You are not a member of this channel");
  }

  const dataToCreate = {
    content: content ? content.trim() : "",
    channelId: Number(channelId),
    senderId: Number(userId),
    parentId: parentId ? Number(parentId) : null,
  };

  if (attachments && attachments.length > 0) {
    dataToCreate.attachments = {
      create: attachments.map((att) => ({
        fileUrl: att.url,
        fileName: att.name,
        fileType: att.type,
        uploadedById: Number(userId),
      })),
    };
  }

  const messageData = await prisma.message.create({
    data: dataToCreate,
    include: {
      _count: {
        select: { replies: true },
      },
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  // Handle Mentions
  if (content) {
    const mentionRegex = /@([a-zA-Z0-9_\s]+)(?=\s|$)/g;
    const matches = [...content.matchAll(mentionRegex)];
    if (matches && matches.length > 0) {
      const names = matches.map(m => m[1].trim());

      const mentionedUsers = await prisma.user.findMany({
        where: {
          OR: names.map(name => ({
            fullName: {
              contains: name,
            }
          }))
        },
        select: {
          id: true,
          inAppNotifications: true,
        }
      });

      const notificationsData = mentionedUsers
        .filter(u => u.id !== Number(userId) && u.inAppNotifications !== false)
        .map(u => ({
          type: "MENTION",
          content: `${messageData.sender.fullName || 'Someone'} mentioned you in a message.`,
          entityId: messageData.id,
          entityType: "MESSAGE",
          userId: u.id,
          companyId: Number(companyId)
        }));

      if (notificationsData.length > 0) {
        await prisma.notification.createMany({
          data: notificationsData
        });
      }
    }
  }

  return {
    message: "Message sent successfully",
    data: {
      id: messageData.id,
      content: messageData.content,
      sender: messageData.sender,
      reactions: [],
      _count: { replies: 0 },
      parentId: messageData.parentId || null,
      channelId: messageData.channelId,
      attachments: messageData.attachments || null,
      createdAt: messageData.createdAt,
    },
  };
};

export const getRecentMessages = async (userId) => {
  const channelMemberships = await prisma.channelMember.findMany({
    where: { userId: Number(userId) },
    select: { channelId: true },
  });

  const channelIds = channelMemberships.map((m) => m.channelId);

  if (channelIds.length === 0) {
    return [];
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId: {
        in: channelIds,
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return messages;
};

export const toggleReaction = async (userId, messageId, emoji) => {
  const existing = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId: Number(messageId),
        userId: Number(userId),
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.messageReaction.delete({
      where: { id: existing.id },
    });
    return { message: "Reaction removed", action: "removed" };
  } else {
    await prisma.messageReaction.create({
      data: {
        messageId: Number(messageId),
        userId: Number(userId),
        emoji,
      },
    });
    return { message: "Reaction added", action: "added" };
  }
};
export const getThreadMessages = async (userId, companyId, messageId) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: Number(userId),
        companyId: Number(companyId),
      },
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this company");
  }

  const thread = await prisma.message.findMany({
    where: {
      OR: [
        { id: Number(messageId) },
        { parentId: Number(messageId) }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      _count: {
        select: { replies: true }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return thread;
};

export const deleteMessage = async (userId, messageId) => {
  const message = await prisma.message.findUnique({
    where: { id: Number(messageId) },
    select: { senderId: true, channelId: true, parentId: true },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (Number(message.senderId) !== Number(userId)) {
    throw new Error("You can only delete your own messages");
  }

  await prisma.message.delete({
    where: { id: Number(messageId) },
  });

  return { channelId: message.channelId, parentId: message.parentId };
};

export const deleteChannel = async (userId, channelId) => {
  const channel = await prisma.channel.findUnique({
    where: { id: parseInt(channelId) },
    include: { members: true },
  });

  if (!channel) {
    throw new Error("Channel not found");
  }

  // Allow deletion if it's a direct channel the user is part of
  // For project channels, we'd need more complex role checking,
  // but let's keep it simple: allow if they are a member.
  const isMember = channel.members.some(m => m.userId === parseInt(userId));
  if (!isMember) {
    throw new Error("You do not have permission to delete this channel");
  }

  await prisma.channel.delete({
    where: { id: parseInt(channelId) },
  });

  return { message: "Channel deleted successfully" };
};

export const markChannelAsRead = async (userId, channelId) => {
  const unreadMessages = await prisma.message.findMany({
    where: {
      channelId,
      senderId: { not: userId },
      seenBy: { none: { userId } }
    },
    select: { id: true }
  });

  if (unreadMessages.length === 0) return { message: "No unread messages" };

  await prisma.messageSeen.createMany({
    data: unreadMessages.map(m => ({
      messageId: m.id,
      userId
    })),
    skipDuplicates: true
  });

  return { message: "Messages marked as read" };
};
