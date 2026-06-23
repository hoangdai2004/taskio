import prisma from "../../config/prisma.js";

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

export const getCalendarEvents = async (userId, companyId, filters = {}) => {
  await checkUserCompany(userId, companyId);

  const { startDate, endDate } = filters;

  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const tasks = await prisma.task.findMany({
    where: {
      companyId: Number(companyId),
      dueDate: Object.keys(dateFilter).length > 0 ? dateFilter : { not: null },
      project: {
        memberships: {
          some: {
            userId: Number(userId),
          },
        },
      },
    },
    include: {
      project: {
        select: { id: true, name: true, color: true },
      },
      assignee: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const taskEvents = tasks.map((task) => ({
    id: `task-${task.id}`,
    entityId: task.id,
    title: task.title,
    description: task.description,
    date: task.dueDate.toISOString().split("T")[0],
    time: task.dueDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    type: "task",
    priority: task.priority,
    status: task.status,
    color: task.project?.color || "#6366f1",
    project: task.project?.name || null,
    projectId: task.projectId,
    assignee: task.assignee?.fullName || "Unassigned",
    fullDate: task.dueDate.toISOString(),
  }));

  const events = await prisma.event.findMany({
    where: {
      companyId: Number(companyId),
      ...(Object.keys(dateFilter).length > 0
        ? { startTime: dateFilter }
        : {}),
      OR: [
        { projectId: null },
        {
          project: {
            memberships: {
              some: { userId: Number(userId) },
            },
          },
        },
      ],
    },
    include: {
      createdBy: {
        select: { id: true, fullName: true },
      },
      project: {
        select: { id: true, name: true, color: true },
      },
      attendees: {
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const customEvents = events.map((event) => ({
    id: `event-${event.id}`,
    entityId: event.id,
    title: event.title,
    description: event.description,
    date: event.startTime.toISOString().split("T")[0],
    time: event.startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    endTime: event.endTime.toISOString(),
    type: "event",
    priority: null,
    status: null,
    color: event.project?.color || "#3b82f6",
    project: event.project?.name || null,
    projectId: event.projectId,
    location: event.location,
    createdBy: event.createdBy.fullName,
    attendees: event.attendees.map((a) => ({
      id: a.user.id,
      fullName: a.user.fullName,
      avatarUrl: a.user.avatarUrl,
      status: a.status,
    })),
    fullDate: event.startTime.toISOString(),
  }));

  const all = [...taskEvents, ...customEvents];
  all.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  return all;
};

export const getTodayEvents = async (userId, companyId) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  return getCalendarEvents(userId, companyId, {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });
};

export const createEvent = async (userId, companyId, data) => {
  await checkUserCompany(userId, companyId);

  const { title, description, startTime, endTime, location, projectId, attendeeIds } = data;

  if (!title) throw new Error("Event title is required");
  if (!startTime) throw new Error("Start time is required");
  if (!endTime) throw new Error("End time is required");

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: parseInt(projectId), companyId: Number(companyId) },
    });
    if (!project) throw new Error("Project not found");
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      startTime: start,
      endTime: end,
      location: location || null,
      companyId: Number(companyId),
      createdById: Number(userId),
      projectId: projectId ? parseInt(projectId) : null,
    },
  });

  if (attendeeIds && attendeeIds.length > 0) {
    for (const attendeeId of attendeeIds) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_companyId: {
            userId: parseInt(attendeeId),
            companyId: Number(companyId),
          },
        },
      });

      if (membership) {
        await prisma.eventAttendee.create({
          data: {
            eventId: event.id,
            userId: parseInt(attendeeId),
          },
        });
      }
    }
  }

  await prisma.eventAttendee.upsert({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: Number(userId),
      },
    },
    update: {},
    create: {
      eventId: event.id,
      userId: Number(userId),
      status: "ACCEPTED",
    },
  });

  return {
    message: "Event created successfully",
    event: {
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
    },
  };
};

export const updateEvent = async (userId, companyId, eventId, data) => {
  await checkUserCompany(userId, companyId);

  const event = await prisma.event.findFirst({
    where: { id: Number(eventId), companyId: Number(companyId), createdById: Number(userId) },
  });

  if (!event) throw new Error("Event not found");

  const { title, description, startTime, endTime, location, projectId } = data;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
      ...(location !== undefined && { location }),
      ...(projectId !== undefined && {
        projectId: projectId ? parseInt(projectId) : null,
      }),
    },
  });

  return {
    message: "Event updated successfully",
    event: {
      id: updated.id,
      title: updated.title,
      startTime: updated.startTime,
      endTime: updated.endTime,
    },
  };
};

export const deleteEvent = async (userId, companyId, eventId) => {
  await checkUserCompany(userId, companyId);

  const event = await prisma.event.findFirst({
    where: { id: Number(eventId), companyId: Number(companyId), createdById: Number(userId) },
  });

  if (!event) throw new Error("Event not found");

  await prisma.eventAttendee.deleteMany({
    where: { eventId },
  });

  await prisma.event.delete({
    where: { id: eventId },
  });

  return { message: "Event deleted successfully" };
};