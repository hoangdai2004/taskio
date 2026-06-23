import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader =
      req.headers.authorization ||
      req.headers["x-access-token"] ||
      req.headers["token"];

    const getTokenFromCookie = (cookieHeader) => {
      if (!cookieHeader) {
        return null;
      }

      return cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("token="))
        ?.split("=")[1];
    };

    let token = null;

    if (authHeader) {
      token = authHeader.toString().startsWith("Bearer ")
        ? authHeader.toString().split(" ")[1]
        : authHeader.toString();
    } else {
      token = getTokenFromCookie(req.headers.cookie);
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};