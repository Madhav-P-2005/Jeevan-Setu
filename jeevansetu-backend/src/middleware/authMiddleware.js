// jeevansetu-backend/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Auth Middleware
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;

    if (!req.user) {
      const user = await User.findById(payload.id).select("role");
      req.user = user ? { id: payload.id, role: user.role } : { id: payload.id };
    }

    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
