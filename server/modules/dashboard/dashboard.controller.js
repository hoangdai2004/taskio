import * as dashboardService from "./dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId, timeRange } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await dashboardService.getDashboardData(userId, parseInt(companyId), timeRange);

    res.json({
      message: "Dashboard loaded successfully",
      data: result,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({
      message: err.message,
    });
  }
};