    import prisma from "../../config/prisma.js";

    const COLORS = [
      "#6366f1",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#3b82f6",
      "#8b5cf6",
    ];

    const getRandomColor = () =>
      COLORS[Math.floor(Math.random() * COLORS.length)];

    const generateProjectInviteCode = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const getUniqueProjectInviteCode = async () => {
      let inviteCode = generateProjectInviteCode();
      let existing = await prisma.project.findUnique({
        where: { inviteCode },
      });

      while (existing) {
        inviteCode = generateProjectInviteCode();
        existing = await prisma.project.findUnique({
          where: { inviteCode },
        });
      }

      return inviteCode;
    };

    const checkUserCompany = async (userId, companyId) => {
      const cId = Number(companyId);
      if (isNaN(cId)) {
        throw new Error("Invalid Company ID");
      }

      const membership = await prisma.membership.findUnique({
        where: {
          userId_companyId: {
            userId: Number(userId),
            companyId: cId,
          },
        },
      });

      if (!membership) {
        throw new Error("You are not a member of this company");
      }

      return membership;
    };

    export const getProjects = async (userId, companyId) => {
      await checkUserCompany(userId, companyId);

      const projects = await prisma.project.findMany({
        where: {
          companyId: Number(companyId),
          memberships: {
            some: {
              userId: Number(userId),
            },
          },
        },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        color: p.color,
        taskCount: p._count.tasks,
        createdAt: p.createdAt,
      }));
    };

    export const getProjectDetail = async (userId, companyId, projectId) => {
      await checkUserCompany(userId, companyId);

      const project = await prisma.project.findFirst({
        where: {
          id: Number(projectId),
          companyId: Number(companyId),
          memberships: {
            some: {
              userId: Number(userId),
            },
          },
        },
        include: {
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              _count: {
                select: { comments: true, attachments: true }
              }
            },
            orderBy: { position: "asc" },
          },
          memberships: {
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
            select: { tasks: true },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const tasksByStatus = {
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: [],
      };

      project.tasks.forEach((task) => {
        tasksByStatus[task.status].push({
          id: task.id,
          code: task.code,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assignee: task.assignee,
          position: task.position,
          comments: task._count?.comments || 0,
          files: task._count?.attachments || 0,
        });
      });

      const members = project.memberships.map((membership) => ({
        id: membership.user.id,
        fullName: membership.user.fullName,
        avatarUrl: membership.user.avatarUrl,
        role: membership.role,
      }));

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        taskCount: project._count.tasks,
        inviteCode: project.inviteCode,
        inviteCodeExpiresAt: project.inviteCodeExpiresAt,
        members,
        tasksByStatus,
        createdAt: project.createdAt,
      };
    };

    const generateProjectSlug = async (name) => {
      let slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      let isUnique = false;
      let counter = 0;
      let finalSlug = slug;

      while (!isUnique) {
        const existing = await prisma.project.findUnique({
          where: { slug: finalSlug },
        });

        if (!existing) {
          isUnique = true;
        } else {
          counter++;
          finalSlug = `${slug}-${counter}`;
        }
      }

      return finalSlug;
    };

    export const createProject = async (userId, companyId, data) => {
      await checkUserCompany(userId, companyId);

      const { name, description } = data;

      if (!name) {
        throw new Error("Project name is required");
      }

      const slug = await generateProjectSlug(name);

      const project = await prisma.project.create({
        data: {
          name,
          slug,
          description: description || null,
          companyId: Number(companyId),
          color: getRandomColor(),
          inviteCode: await getUniqueProjectInviteCode(),
        },
      });

      const projectMembership = await prisma.projectMembership.create({
        data: {
          userId: Number(userId),
          projectId: project.id,
          role: "OWNER",
        },
      });

      await prisma.channel.create({
        data: {
          name: project.name,
          companyId: Number(companyId),
          projectId: project.id,
          members: {
            create: {
              userId: Number(userId),
            },
          },
        },
      });

      return {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        color: project.color,
        inviteCode: project.inviteCode,
        message: "Project created successfully",
      };
    };

    export const updateProject = async (userId, companyId, projectId, data) => {
      await checkUserCompany(userId, companyId);

      const project = await prisma.project.findFirst({
        where: {
          id: Number(projectId),
          companyId: Number(companyId),
          memberships: {
            some: { userId: Number(userId) },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found or you are not a member");
      }

      const { name, description } = data;

      const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
      });

        return {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        message: "Project updated successfully",
      };
    };

    export const joinProject = async (userId, companyId, inviteCode) => {
      if (!inviteCode) {
        throw new Error("Project invite code is required");
      }

      await checkUserCompany(userId, companyId);

      const project = await prisma.project.findFirst({
        where: {
          inviteCode,
          companyId: Number(companyId),
        },
      });

      if (!project) {
        throw new Error("Invalid project invite code");
      }

      if (project.inviteCodeExpiresAt && new Date() > project.inviteCodeExpiresAt) {
        throw new Error("Project invite code has expired");
      }

      const existingMembership = await prisma.projectMembership.findUnique({
        where: {
          userId_projectId: {
            userId: Number(userId),
            projectId: project.id,
          },
        },
      });

      if (existingMembership) {
        return {
          message: "Already a member of this project",
          project: {
            id: project.id,
            name: project.name,
          },
        };
      }

      await prisma.projectMembership.create({
        data: {
          userId: Number(userId),
          projectId: project.id,
          role: "MEMBER",
        },
      });

      const channel = await prisma.channel.findFirst({
        where: { projectId: project.id },
      });

      if (channel) {
        await prisma.channelMember.upsert({
          where: {
            channelId_userId: {
              channelId: channel.id,
              userId: Number(userId),
            },
          },
          update: {},
          create: {
            channelId: channel.id,
            userId: Number(userId),
          },
        });
      }

      return {
        message: "Joined project successfully",
        project: {
          id: project.id,
          name: project.name,
        },
      };
    };

    export const refreshProjectInviteCode = async (userId, companyId, projectId) => {
      await checkUserCompany(userId, companyId);

      const project = await prisma.project.findFirst({
        where: {
          id: Number(projectId),
          companyId: Number(companyId),
          memberships: {
            some: {
              userId: Number(userId),
              role: { in: ["OWNER", "ADMIN"] },
            },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const inviteCode = await getUniqueProjectInviteCode();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const updated = await prisma.project.update({
        where: { id: Number(projectId) },
        data: {
          inviteCode,
          inviteCodeExpiresAt: expiresAt,
        },
      });

      return {
        message: "Project invite code refreshed successfully",
        inviteCode: updated.inviteCode,
        expiresAt: updated.inviteCodeExpiresAt,
      };
    };

export const addProjectMember = async (userId, companyId, projectId, memberId) => {
  await checkUserCompany(userId, companyId);
  await checkUserCompany(memberId, companyId);

  const project = await prisma.project.findFirst({
    where: {
      id: Number(projectId),
      companyId: Number(companyId),
      memberships: {
        some: {
          userId: Number(userId),
          role: { in: ["OWNER", "ADMIN"] },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found or you don't have permission to add members");
  }

  const existingMembership = await prisma.projectMembership.findUnique({
    where: {
      userId_projectId: {
        userId: Number(memberId),
        projectId: project.id,
      },
    },
  });

  if (existingMembership) {
    throw new Error("User is already a member of this project");
  }

  await prisma.projectMembership.create({
    data: {
      userId: Number(memberId),
      projectId: project.id,
      role: "MEMBER",
    },
  });

  const channel = await prisma.channel.findFirst({
    where: { projectId: project.id },
  });

  if (channel) {
    await prisma.channelMember.upsert({
      where: {
        channelId_userId: {
          channelId: channel.id,
          userId: Number(memberId),
        },
      },
      update: {},
      create: {
        channelId: channel.id,
        userId: Number(memberId),
      },
    });
  }

  return {
    message: "Member added to project successfully",
  };
};

    export const deleteProject = async (userId, companyId, projectId) => {
      const companyMembership = await checkUserCompany(userId, companyId);

      const project = await prisma.project.findFirst({
        where: {
          id: Number(projectId),
          companyId: Number(companyId),
        },
        include: {
          memberships: {
            where: { userId: Number(userId) }
          }
        }
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const isCompanyOwner = companyMembership.role === "OWNER";
      const isProjectOwner = project.memberships.length > 0 && project.memberships[0].role === "OWNER";

      if (!isCompanyOwner && !isProjectOwner) {
        throw new Error("You do not have permission to delete this project.");
      }

      await prisma.task.deleteMany({
        where: { projectId: Number(projectId) },
      });

      await prisma.project.delete({
        where: { id: Number(projectId) },
      });

      return {
        message: "Project deleted successfully",
      };
    };

    export const updateTaskStatus = async (userId, companyId, taskId, newStatus, position) => {
      await checkUserCompany(userId, companyId);

      const task = await prisma.task.findFirst({
        where: {
          id: Number(taskId),
          companyId: Number(companyId),
          project: {
            memberships: {
              some: { userId: Number(userId) },
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
      if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status");
      }

      const updated = await prisma.task.update({
        where: { id: Number(taskId) },
        data: {
          status: newStatus,
          ...(position !== undefined && { position }),
        },
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        message: "Task status updated",
        task: {
          id: updated.id,
          title: updated.title,
          status: updated.status,
          position: updated.position,
          assignee: updated.assignee,
        },
      };
    };