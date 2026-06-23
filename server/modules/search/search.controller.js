import * as searchService from "./search.service.js";

export const globalSearch = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { q: query } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const results = await searchService.globalSearch(userId, query);
    res.json(results);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};