// jeevansetu-backend/src/routes/health.js


import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend Running Successfully",
  });
});

export default router;