// jeevansetu-backend/src/routes/donationRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { logDonation, listMyDonations } from "../controllers/donationController.js";

const router = express.Router();

router.use(protect);

router.post("/", logDonation);
router.get("/me", listMyDonations);

export default router;
