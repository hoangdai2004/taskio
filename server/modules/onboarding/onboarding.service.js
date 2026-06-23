import prisma from "../../config/prisma.js";

const generateSlug = async (name) => {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let isUnique = false;
  let counter = 0;
  let finalSlug = slug;

  while (!isUnique) {
    const existing = await prisma.company.findUnique({
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

export const createCompanyOnboarding = async (userId, data) => {
  const ownerId = Number(userId);
  const { name } = data;
  let { slug } = data;

  if (!name) {
    throw new Error("Company name is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: ownerId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!slug) {
    slug = await generateSlug(name);
  } else {
    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error("Company URL slug already taken");
    }
  }

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      ownerId,
      inviteCode: generateInviteCode(),
    },
  });

  await prisma.membership.create({
    data: {
      userId: ownerId,
      companyId: company.id,
      role: "OWNER",
    },
  });

  await prisma.user.update({
    where: { id: ownerId },
    data: {
      activeCompanyId: company.id,
    },
  });

  return {
    message: "Company created successfully",
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
    },
    activeCompanyId: company.id,
  };
};

export const getOnboardingStatus = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const companyCount = user.memberships.length;

  if (companyCount === 0) {
    return {
      status: "NEEDS_COMPANY",
      message: "Please create or join a company",
      companyCount: 0,
    };
  }

  if (companyCount === 1) {
    return {
      status: "AUTO_SELECT",
      message: "Company auto-selected",
      companyId: user.memberships[0].company.id,
      companyCount: 1,
    };
  }

  if (!user.activeCompanyId) {
    return {
      status: "NEEDS_SELECTION",
      message: "Please select a company",
      companies: user.memberships.map((m) => ({
        id: m.company.id,
        name: m.company.name,
        slug: m.company.slug,
        role: m.role,
      })),
      companyCount,
    };
  }

  return {
    status: "COMPLETED",
    message: "Onboarding completed",
    activeCompanyId: user.activeCompanyId,
    companyCount,
  };
};

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
