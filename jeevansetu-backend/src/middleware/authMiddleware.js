// jeevansetu-backend/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

// Auth Middleware
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.user = payload;
    req.userId = payload.id;
    req.user = { id: payload.id };
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
