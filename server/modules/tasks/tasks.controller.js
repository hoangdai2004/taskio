import * as tasksService from "./tasks.service.js";

export const getTasks = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.getTasks(userId, parseInt(companyId), req.query);

    res.json({
      message: "Tasks loaded successfully",
      ...result,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const getTaskDetail = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const task = await tasksService.getTaskDetail(userId, parseInt(companyId), parseInt(taskId));

    res.json({
      message: "Task loaded successfully",
      task,
    });
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.createTask(userId, parseInt(companyId), req.body);

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.updateTask(
      userId,
      parseInt(companyId),
      parseInt(taskId),
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

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.deleteTask(userId, parseInt(companyId), parseInt(taskId));

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.addComment(userId, parseInt(companyId), parseInt(taskId), content);

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const assignTask = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskId } = req.params;
    const { assigneeId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.assignTask(
      userId,
      parseInt(companyId),
      parseInt(taskId),
      assigneeId
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 403;
    res.status(status).json({
      message: err.message,
    });
  }
};

export const bulkDeleteTasks = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { taskIds } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await tasksService.bulkDeleteTasks(
      userId,
      parseInt(companyId),
      taskIds
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
