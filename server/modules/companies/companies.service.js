import prisma from "../../config/prisma.js";

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createCompany = async ({ userId, name, slug }) => {
  if (!name || !slug) {
    throw new Error("Company name and slug are required");
  }

  const existingCompany = await prisma.company.findUnique({
    where: { slug },
  });

  if (existingCompany) {
    throw new Error("Company URL slug already taken");
  }

  let inviteCode = generateInviteCode();
  let existingInvite = await prisma.company.findUnique({
    where: { inviteCode },
  });

  while (existingInvite) {
    inviteCode = generateInviteCode();
    existingInvite = await prisma.company.findUnique({
      where: { inviteCode },
    });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      inviteCode,
      inviteCodeExpiresAt: expiresAt,
      ownerId: userId,
    },
  });

  await prisma.membership.create({
    data: {
      userId,
      companyId: company.id,
      role: "OWNER",
    },
  });

  return company;
};

export const joinCompany = async ({ userId, inviteCode }) => {
  if (!inviteCode) {
    throw new Error("Invite code is required");
  }

  const company = await prisma.company.findUnique({
    where: { inviteCode },
  });

  if (!company) {
    throw new Error("Invalid invite code");
  }

  if (company.inviteCodeExpiresAt && new Date() > company.inviteCodeExpiresAt) {
    throw new Error("Invite code has expired");
  }

  if (company.ownerId === userId) {
    return { message: "You already own this company", company };
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId: company.id,
      },
    },
  });

  if (existingMembership) {
    return { message: "You are already a member of this company", company };
  }

  await prisma.membership.create({
    data: {
      userId,
      companyId: company.id,
      role: "MEMBER",
    },
  });

  return { message: "Joined company successfully", company };
};

export const refreshCompanyInviteCode = async (companyId, userId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can refresh invite code");
  }

  let inviteCode = generateInviteCode();
  let existingInvite = await prisma.company.findUnique({
    where: { inviteCode },
  });

  while (existingInvite) {
    inviteCode = generateInviteCode();
    existingInvite = await prisma.company.findUnique({
      where: { inviteCode },
    });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      inviteCode,
      inviteCodeExpiresAt: expiresAt,
    },
  });

  return {
    message: "Invite code refreshed successfully",
    inviteCode: updated.inviteCode,
    expiresAt: updated.inviteCodeExpiresAt,
  };
};

export const getCompanyMembers = async (companyId, userId) => {
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

  const company = await prisma.company.findUnique({
    where: { id: cId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  return company.members.map((m) => ({
    id: m.user.id,
    email: m.user.email,
    fullName: m.user.fullName,
    avatarUrl: m.user.avatarUrl,
    role: m.role,
    joinedAt: m.createdAt,
  }));
};

export const getCompanyDetail = async (companyId, userId) => {
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

  const company = await prisma.company.findUnique({
    where: { id: cId },
    include: {
      members: true,
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const isOwnerOrAdmin = membership.role === "OWNER" || membership.role === "ADMIN";

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    ...(isOwnerOrAdmin && {
      inviteCode: company.inviteCode,
      inviteCodeExpiresAt: company.inviteCodeExpiresAt,
    }),
    memberCount: company.members.length,
    isOwner: Number(company.ownerId) === Number(userId),
  };
};

export const changeMemberRole = async (companyId, userId, targetUserId, newRole) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can change member roles");
  }

  if (!["OWNER", "ADMIN", "MEMBER"].includes(newRole)) {
    throw new Error("Invalid role");
  }

  const targetMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: targetUserId,
        companyId,
      },
    },
  });

  if (!targetMembership) {
    throw new Error("Member not found in this company");
  }

  if (targetUserId === company.ownerId) {
    throw new Error("Cannot change owner's role");
  }

  const updated = await prisma.membership.update({
    where: {
      userId_companyId: {
        userId: targetUserId,
        companyId,
      },
    },
    data: {
      role: newRole,
    },
  });

  return {
    message: "Member role updated successfully",
    role: updated.role,
  };
};

export const removeMember = async (companyId, userId, targetUserId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can remove members");
  }

  if (targetUserId === company.ownerId) {
    throw new Error("Cannot remove company owner");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: targetUserId,
        companyId,
      },
    },
  });

  if (!membership) {
    throw new Error("Member not found");
  }

  await prisma.membership.delete({
    where: {
      userId_companyId: {
        userId: targetUserId,
        companyId,
      },
    },
  });

  return {
    message: "Member removed successfully",
  };
};

export const updateCompany = async (companyId, userId, data) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can update company");
  }

  const { name, slug } = data;

  if (slug && slug !== company.slug) {
    const existing = await prisma.company.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new Error("Slug already taken");
    }
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(name && { name }),
      ...(slug && { slug }),
    },
  });

  return {
    message: "Company updated successfully",
    company: {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
    },
  };
};

export const deleteCompany = async (companyId, userId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can delete company");
  }

  await prisma.membership.deleteMany({
    where: { companyId },
  });

  await prisma.company.delete({
    where: { id: companyId },
  });

  return {
    message: "Company deleted successfully",
  };
};

export const requestJoinCompany = async ({ userId, email }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const targetUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!targetUser) {
    throw new Error("User with this email not found");
  }

  if (targetUser.id === userId) {
    throw new Error("You cannot request to join your own company");
  }

  return {
    message: "Join request sent successfully. The company owner will review your request.",
  };
};

export const getJoinRequests = async (companyId, userId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can view join requests");
  }

  const requests = await prisma.companyJoinRequest.findMany({
    where: {
      companyId,
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests.map((request) => ({
    id: request.id,
    email: request.email,
    status: request.status,
    companyName: request.company.name,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  }));
};

export const approveJoinRequest = async (companyId, userId, requestId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can approve join requests");
  }

  const request = await prisma.companyJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.companyId !== companyId) {
    throw new Error("Join request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request has already been processed");
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: request.email },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: targetUser.id,
        companyId,
      },
    },
  });

  if (existingMembership) {
    await prisma.companyJoinRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });

    return {
      message: "User is already a member of this company",
    };
  }

  await prisma.membership.create({
    data: {
      userId: targetUser.id,
      companyId,
      role: "MEMBER",
    },
  });

  await prisma.companyJoinRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });

  return {
    message: "Join request approved successfully",
  };
};

export const rejectJoinRequest = async (companyId, userId, requestId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  if (company.ownerId !== userId) {
    throw new Error("Only owner can reject join requests");
  }

  const request = await prisma.companyJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.companyId !== companyId) {
    throw new Error("Join request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Request has already been processed");
  }

  await prisma.companyJoinRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  return {
    message: "Join request rejected",
  };
};

export const getCompanyStats = async (companyId, userId) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    throw new Error("Only admins or owners can access company statistics");
  }

  const [userCount, projectCount, taskCount] = await Promise.all([
    prisma.membership.count({ where: { companyId } }),
    prisma.project.count({ where: { companyId } }),
    prisma.task.count({ where: { companyId } }),
  ]);

  const tasksByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { companyId },
    _count: true,
  });

  const completedTasks = await prisma.task.count({
    where: { companyId, status: 'DONE' }
  });

  const overdueTasks = await prisma.task.count({
    where: { 
      companyId, 
      status: { not: 'DONE' },
      dueDate: { lt: new Date() }
    }
  });

  const recentProjects = await prisma.project.findMany({
    where: { companyId },
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { tasks: true }
      },
      tasks: {
        select: { status: true }
      },
      memberships: {
        take: 3,
        include: {
          user: {
            select: { fullName: true, avatarUrl: true }
          }
        }
      }
    }
  });

  const formattedProjects = recentProjects.map(proj => {
    const totalTasks = proj._count.tasks;
    const doneTasks = proj.tasks.filter(t => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      id: proj.id,
      name: proj.name,
      owner: proj.memberships[0]?.user.fullName || "N/A",
      tasks: totalTasks,
      progress,
      color: proj.color
    };
  });

  return {
    totalUsers: userCount,
    totalProjects: projectCount,
    totalTasks: taskCount,
    completedTasks,
    overdueTasks,
    tasksByStatus: tasksByStatus.map(s => ({
      name: s.status,
      value: s._count
    })),
    recentProjects: formattedProjects
  };
};
