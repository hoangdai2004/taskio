import * as companyService from "./companies.service.js";

export const createCompany = async (req, res) => {
  try {
    const result = await companyService.createCompany({
      userId: req.user.userId,
      ...req.body,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const joinCompany = async (req, res) => {
  try {
    const result = await companyService.joinCompany({
      userId: req.user.userId,
      ...req.body,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const requestJoinCompany = async (req, res) => {
  try {
    const result = await companyService.requestJoinCompany({
      userId: req.user.userId,
      ...req.body,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getJoinRequests = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await companyService.getJoinRequests(
      parseInt(companyId),
      userId
    );

    res.json({
      message: "Join requests loaded successfully",
      requests,
    });
  } catch (err) {
    const status = err.message.includes("not owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const approveJoinRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId, requestId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await companyService.approveJoinRequest(
      parseInt(companyId),
      userId,
      parseInt(requestId)
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const rejectJoinRequest = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId, requestId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await companyService.rejectJoinRequest(
      parseInt(companyId),
      userId,
      parseInt(requestId)
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getMembers = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const members = await companyService.getCompanyMembers(
      parsedCompanyId,
      userId
    );

    res.json({
      message: "Members loaded successfully",
      members,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const company = await companyService.getCompanyDetail(
      parsedCompanyId,
      userId
    );

    res.json({
      message: "Company loaded successfully",
      company,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const changeMemberRole = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    const { memberId, role } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await companyService.changeMemberRole(
      parseInt(companyId),
      userId,
      parseInt(memberId),
      role
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;
    const { memberId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await companyService.removeMember(
      parseInt(companyId),
      userId,
      parseInt(memberId)
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const result = await companyService.updateCompany(
      parsedCompanyId,
      userId,
      req.body
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const result = await companyService.deleteCompany(parsedCompanyId, userId);

    res.json(result);
  } catch (err) {
    const status = err.message.includes("owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const refreshInviteCode = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const result = await companyService.refreshCompanyInviteCode(
      parsedCompanyId,
      userId
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("owner") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const stats = await companyService.getCompanyStats(parsedCompanyId, userId);
    res.json(stats);
  } catch (err) {
    const status = err.message.includes("Only admins") ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};
