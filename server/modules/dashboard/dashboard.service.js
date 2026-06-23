import prisma from "../../config/prisma.js";

export const getDashboardData = async (userId, companyId, timeRange = "all") => {
  if (!companyId) {
    throw new Error("Company ID is required");
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

  const now = new Date();
  let dateFilter = {};

  if (timeRange === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Monday as start of week
    startOfWeek.setHours(0, 0, 0, 0);
    dateFilter = { createdAt: { gte: startOfWeek } };
  } else if (timeRange === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { createdAt: { gte: startOfMonth } };
  }

  const tasks = await prisma.task.findMany({
    where: {
      companyId: Number(companyId),
      ...dateFilter,
      project: {
        memberships: {
          some: {
            userId: Number(userId),
          },
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
    },
  });

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "DONE"
  ).length;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueTodayCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow
  ).length;

  const stats = {
    total,
    todo,
    inProgress,
    done,
    overdue,
    dueTodayCount,
  };

  const chartData = [
    { label: "To Do", value: todo, color: "#fbbf24" },
    { label: "In Progress", value: inProgress, color: "#3b82f6" },
    { label: "Done", value: done, color: "#10b981" },
  ];

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const upcoming = tasks
    .filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) <= nextWeek &&
        t.status !== "DONE"
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      project: t.project.name,
    }));

  const activity = tasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      action: "updated task",
      target: `"${t.title}" in ${t.project.name}`,
      assignee: t.assignee?.fullName || "Unassigned",
      avatar: t.assignee?.avatarUrl,
      createdAt: t.updatedAt,
    }));

  return {
    stats,
    chartData,
    upcoming,
    activity,
  };
};