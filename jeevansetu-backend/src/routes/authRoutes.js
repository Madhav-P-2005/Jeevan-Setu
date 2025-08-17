// jeevansetu-backend/src/routes/authRoutes.js

import express from "express";

import { registerUser  } from "../controllers/authController.js";


// Initialize router
const router = express.Router();


// Routes 
router.post('/register' ,  registerUser);


export default router;