import * as onboardingService from "./onboarding.service.js";

export const createCompany = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await onboardingService.createCompanyOnboarding(
      userId,
      req.body
    );

    res.json(result);
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const getStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const status = await onboardingService.getOnboardingStatus(userId);

    res.json(status);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
