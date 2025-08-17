// jeevansetu-backend/src/routes/authRoutes.js

import express from "express";

import { registerUser, loginUser } from "../controllers/authController.js";


// Initialize router
const router = express.Router();


// Routes 
router.post('/register' ,  registerUser);
router.post('/login' , loginUser);

export default router;