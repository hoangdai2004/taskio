import prisma from "../../config/prisma.js";
import * as notificationsService from "../notifications/notifications.service.js";

const generateTaskCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let attempts = 0;
  const maxAttempts = 10;

  while (true) {
    code = '';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    attempts++;
    if (attempts >= maxAttempts) {
      throw new Error("Unable to generate unique task code");
    }

    const existing = await prisma.task.findUnique({
      where: { code },
    });

    if (!existing) break;
  }

  return code;
};

const checkUserCompany = async (userId, companyId) => {
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

  return membership;
};

export const getTasks = async (userId, companyId, filters = {}) => {
  await checkUserCompany(userId, companyId);

  const { projectId, status, priority, assigneeId, dueDate, search, page = 1, limit = 10 } = filters;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    companyId: Number(companyId),
    project: {
      memberships: {
        some: {
          userId: Number(userId),
        },
      },
    },
    ...(projectId && { projectId: parseInt(projectId) }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeId && { assigneeId: parseInt(assigneeId) }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks: tasks.map((t) => ({
      id: t.id,
      code: t.code,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      projectId: t.projectId,
      project: t.project.name,
      assignee: t.assignee,
      createdBy: t.createdBy.fullName,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getTaskDetail = async (userId, companyId, taskId) => {
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
    include: {
      project: true,
      assignee: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return {
    id: task.id,
    code: task.code,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    projectId: task.projectId,
    project: task.project,
    assignee: task.assignee,
    createdBy: task.createdBy,
    comments: task.comments,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};

export const createTask = async (userId, companyId, data) => {
  await checkUserCompany(userId, companyId);

  const { title, description, projectId, assigneeId, priority, dueDate, status } = data;

  if (!title) {
    throw new Error("Task title is required");
  }

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: parseInt(projectId),
      companyId: Number(companyId),
      memberships: {
        some: { userId: Number(userId) },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found or you are not a member");
  }

  if (assigneeId) {
    const assigneeMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: {
          userId: parseInt(assigneeId),
          projectId: parseInt(projectId),
        },
      },
    });

    if (!assigneeMembership) {
      throw new Error("Assignee is not a member of this project");
    }
  }

  const code = await generateTaskCode();

  const task = await prisma.task.create({
    data: {
      code,
      title,
      description: description || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      companyId: Number(companyId),
      projectId: parseInt(projectId),
      createdById: Number(userId),
      assigneeId: assigneeId ? parseInt(assigneeId) : null,
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

  if (task.assigneeId) {
    await notificationsService.notifyTaskAssigned(task.id, task.assigneeId);
  }

  return {
    id: task.id,
    code: task.code,
    title: task.title,
    message: "Task created successfully",
  };
};

export const updateTask = async (userId, companyId, taskId, data) => {
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

  const { title, description, status, priority, dueDate, assigneeId } = data;

  if (assigneeId && assigneeId !== task.assigneeId) {
    const assigneeMembership = await prisma.projectMembership.findUnique({
      where: {
        userId_projectId: {
          userId: parseInt(assigneeId),
          projectId: task.projectId,
        },
      },
    });

    if (!assigneeMembership) {
      throw new Error("Assignee is not a member of this project");
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId) : null }),
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

  if (assigneeId && assigneeId !== task.assigneeId) {
    await notificationsService.notifyTaskAssigned(updated.id, updated.assigneeId);
  }

  return {
    id: updated.id,
    title: updated.title,
    assignee: updated.assignee,
    message: "Task updated successfully",
  };
};

export const deleteTask = async (userId, companyId, taskId) => {
  const companyMembership = await checkUserCompany(userId, companyId);

  const task = await prisma.task.findFirst({
    where: {
      id: Number(taskId),
      companyId: Number(companyId),
    },
    include: {
      project: {
        include: {
          memberships: {
            where: { userId: Number(userId) }
          }
        }
      }
    }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const isCompanyOwner = companyMembership.role === "OWNER";
  const isProjectOwner = task.project.memberships.length > 0 && task.project.memberships[0].role === "OWNER";

  if (!isCompanyOwner && !isProjectOwner) {
    throw new Error("You do not have permission to delete this task. Only company owners and project owners can delete tasks.");
  }

  await prisma.comment.deleteMany({
    where: { taskId },
  });

  await prisma.task.delete({
    where: { id: taskId },
  });

  return {
    message: "Task deleted successfully",
  };
};

export const addComment = async (userId, companyId, taskId, content) => {
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

  if (!content || content.trim().length === 0) {
    throw new Error("Comment content is required");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId: Number(taskId),
      userId: Number(userId),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    user: comment.user,
    createdAt: comment.createdAt,
    message: "Comment added successfully",
  };
};

export const assignTask = async (userId, companyId, taskId, assigneeId) => {
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
  const assigneeMembership = await prisma.projectMembership.findUnique({
    where: {
      userId_projectId: {
        userId: parseInt(assigneeId),
        projectId: task.projectId,
      },
    },
  });

  if (!assigneeMembership) {
    throw new Error("Assignee is not a member of this project");
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId: parseInt(assigneeId),
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
    id: updated.id,
    assignee: updated.assignee,
    message: "Task assigned successfully",
  };
};

export const bulkDeleteTasks = async (userId, companyId, taskIds) => {
  const companyMembership = await checkUserCompany(userId, companyId);

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new Error("No task IDs provided");
  }

  const isCompanyOwner = companyMembership.role === "OWNER";

  // Get tasks to check permissions
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      companyId: Number(companyId),
    },
    include: {
      project: {
        include: {
          memberships: {
            where: { userId: Number(userId) }
          }
        }
      }
    }
  });

  const allowedTaskIds = tasks.filter(task => {
    if (isCompanyOwner) return true;
    const isProjectOwner = task.project.memberships.length > 0 && task.project.memberships[0].role === "OWNER";
    return isProjectOwner;
  }).map(t => t.id);

  if (allowedTaskIds.length === 0) {
    throw new Error("You do not have permission to delete any of the selected tasks.");
  }

  const result = await prisma.task.deleteMany({
    where: {
      id: { in: allowedTaskIds },
    },
  });

  return {
    message: `${result.count} tasks deleted successfully`,
    count: result.count,
  };
};