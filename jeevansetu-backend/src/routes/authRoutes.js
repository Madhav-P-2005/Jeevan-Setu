// jeevansetu-backend/src/routes/authRoutes.js

import express from "express";

import { registerUser, loginUser } from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";


// Initialize router
const router = express.Router();


// Routes 
router.post('/register' ,  registerUser);
router.post('/login' , loginUser);
router.get('/protected', protect , (req ,res) =>{
    return res.status(200).json({
        success : true,
        message : "Protected route accessed Successfully",
        userId  : req.userId
    })
})

export default router;