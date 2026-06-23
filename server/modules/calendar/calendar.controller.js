import * as calendarService from "./calendar.service.js";

export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const events = await calendarService.getCalendarEvents(
      userId,
      parseInt(companyId),
      { startDate, endDate }
    );

    res.json({
      message: "Calendar events loaded successfully",
      events,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getTodayEvents = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const events = await calendarService.getTodayEvents(
      userId,
      parseInt(companyId)
    );

    res.json({
      message: "Today's events loaded successfully",
      events,
    });
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await calendarService.createEvent(
      userId,
      parseInt(companyId),
      req.body
    );

    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("not a member") ? 403 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await calendarService.updateEvent(
      userId,
      parseInt(companyId),
      parseInt(eventId),
      req.body
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { companyId } = req.query;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const result = await calendarService.deleteEvent(
      userId,
      parseInt(companyId),
      parseInt(eventId)
    );

    res.json(result);
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};