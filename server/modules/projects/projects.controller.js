import * as projectsService from "./projects.service.js";

export const getProjects = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const projects = await projectsService.getProjects(userId, parseInt(companyId));

    res.json({
      message: "Projects loaded successfully",
      projects,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getProjectDetail = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const project = await projectsService.getProjectDetail(
      userId,
      parseInt(companyId),
      parseInt(projectId)
    );

    res.json({
      message: "Project loaded successfully",
      project,
    });
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const joinProject = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { inviteCode } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await projectsService.joinProject(
      userId,
      parseInt(companyId),
      inviteCode
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await projectsService.createProject(
      userId,
      parseInt(companyId),
      req.body
    );

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await projectsService.updateProject(
      userId,
      parseInt(companyId),
      parseInt(projectId),
      req.body
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await projectsService.deleteProject(
      userId,
      parseInt(companyId),
      parseInt(projectId)
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskId } = req.params;
    const { status, position } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await projectsService.updateTaskStatus(
      userId,
      parseInt(companyId),
      parseInt(taskId),
      status,
      position
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const refreshInviteCode = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await projectsService.refreshProjectInviteCode(
      userId,
      parseInt(companyId),
      parseInt(projectId)
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { projectId } = req.params;
    const { memberId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    const result = await projectsService.addProjectMember(
      userId,
      parseInt(companyId),
      parseInt(projectId),
      parseInt(memberId)
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("permission") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};