import { getAnalyticsData } from "./analytics.service.js";

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { companyId, startDate, endDate } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const data = await getAnalyticsData(userId, companyId, startDate, endDate);

    return res.json({ message: "Analytics data fetched successfully", data });
  } catch (error) {
    console.error("Analytics error:", error);

    if (error.message.includes("permission")) {
      return res.status(403).json({ message: error.message });
    }

    if (error.message.includes("not a member")) {
      return res.status(403).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
