import prisma from "../../config/prisma.js";

export const globalSearch = async (userId, query) => {
  if (!query || query.trim().length === 0) {
    return { tasks: [], projects: [], users: [] };
  }

  const searchTerm = query.trim();

  const userMemberships = await prisma.membership.findMany({
    where: { userId: Number(userId) },
    select: { companyId: true },
  });

  const companyIds = userMemberships.map((m) => m.companyId);

  if (companyIds.length === 0) {
    return { tasks: [], projects: [], users: [] };
  }

  const tasks = await prisma.task.findMany({
    where: {
      companyId: {
        in: companyIds,
      },
      project: {
        memberships: {
          some: {
            userId: Number(userId),
          },
        },
      },
      OR: [
        {
          title: {
            contains: searchTerm,
          },
        },
        {
          description: {
            contains: searchTerm,
          },
        },
        {
          code: {
            contains: searchTerm,
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
      assignee: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    take: 20,
  });

  const projects = await prisma.project.findMany({
    where: {
      companyId: {
        in: companyIds,
      },
      memberships: {
        some: {
          userId: Number(userId),
        },
      },
      OR: [
        {
          name: {
            contains: searchTerm,
          },
        },
        {
          description: {
            contains: searchTerm,
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
    },
    take: 10,
  });

  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          companyId: {
            in: companyIds,
          },
        },
      },
      OR: [
        {
          fullName: {
            contains: searchTerm,
          },
        },
        {
          email: {
            contains: searchTerm,
          },
        },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
    },
    take: 10,
  });

  return {
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      project: task.project,
      assignee: task.assignee,
    })),
    projects,
    users,
  };
};