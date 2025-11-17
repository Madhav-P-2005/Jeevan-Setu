// jeevansetu-backend/src/routes/requestRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRequest,
  listRequests,
  matchRequest,
  updateRequestStatus,
} from "../controllers/requestController.js";

const router = express.Router();

router.use(protect);

router.post("/", createRequest);
router.get("/", listRequests);
router.post("/:id/match", matchRequest);
router.patch("/:id/status", updateRequestStatus);

export default router;
