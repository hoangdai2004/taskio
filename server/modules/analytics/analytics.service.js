import prisma from "../../config/prisma.js";

export const getAnalyticsData = async (userId, companyId, startDateStr, endDateStr) => {
  if (!companyId) {
    throw new Error("Company ID is required");
  }

  // Check membership and role
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

  if (!["OWNER", "ADMIN"].includes(membership.role)) {
    throw new Error("You do not have permission to view analytics");
  }

  const taskQuery = { companyId: Number(companyId) };

  if (startDateStr && endDateStr) {
    // End date is inclusive, so we add 1 day to make sure we cover the entire end date.
    const end = new Date(endDateStr);
    end.setDate(end.getDate() + 1);

    taskQuery.createdAt = {
      gte: new Date(startDateStr),
      lt: end
    };
  }

  // Fetch all tasks for the company
  const tasks = await prisma.task.findMany({
    where: taskQuery,
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignee: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
  });

  // Fetch all members
  const members = await prisma.membership.findMany({
    where: { companyId: Number(companyId) },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
  });

  // Fetch all projects
  const projects = await prisma.project.findMany({
    where: { companyId: Number(companyId) },
    select: { id: true, name: true, color: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Overview Stats ---
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "DONE"
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const overviewStats = {
    totalTasks,
    completedTasks: doneTasks,
    completionRate,
    overdueTasks,
    activeMembers: members.length,
  };

  // --- Project Progress ---
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const projectTotal = projectTasks.length;
    const projectDone = projectTasks.filter((t) => t.status === "DONE").length;
    const projectInProgress = projectTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const projectTodo = projectTasks.filter((t) => t.status === "TODO").length;
    const progress = projectTotal > 0 ? Math.round((projectDone / projectTotal) * 100) : 0;

    return {
      id: project.id,
      name: project.name,
      color: project.color,
      total: projectTotal,
      done: projectDone,
      inProgress: projectInProgress,
      todo: projectTodo,
      progress,
    };
  });

  // --- Member Performance ---
  const memberPerformance = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === m.user.id);
    const total = memberTasks.length;
    const done = memberTasks.filter((t) => t.status === "DONE").length;
    const inProgress = memberTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const overdue = memberTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "DONE"
    ).length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      id: m.user.id,
      fullName: m.user.fullName || m.user.email,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      totalTasks: total,
      done,
      inProgress,
      overdue,
      completionRate: rate,
    };
  });

  // Sort by completion rate desc, then by done desc
  memberPerformance.sort((a, b) => b.completionRate - a.completionRate || b.done - a.done);

  // --- Weekly Trend (last 7 days) ---
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const completed = tasks.filter((t) => {
      if (t.status !== "DONE") return false;
      const updated = new Date(t.updatedAt);
      return updated >= day && updated < nextDay;
    }).length;

    weeklyTrend.push({
      date: day.toISOString().split("T")[0],
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      completed,
    });
  }

  // --- Workload Distribution (top members by task count) ---
  const workloadDistribution = memberPerformance
    .filter((m) => m.totalTasks > 0)
    .slice(0, 8)
    .map((m) => ({
      label: m.fullName,
      value: m.totalTasks,
      color: `hsl(${(m.id * 47) % 360}, 65%, 55%)`,
    }));

  return {
    overviewStats,
    projectProgress,
    memberPerformance,
    weeklyTrend,
    workloadDistribution,
  };
};
