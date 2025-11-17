// jeevansetu-backend/src/routes/authRoutes.js

import express from "express";

import {
  registerUser,
  loginUser,
  refreshAccessTokenController,
  LogoutUserController,
  getProfileController,
  updateProfileController,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";


// Initialize router
const router = express.Router();


// Routes 
router.post('/register' ,  registerUser);
router.post('/login' , loginUser);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-otp', resendEmailOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/protected', protect , (req ,res) =>{
    return res.status(200).json({
        success : true,
        message : "Protected route accessed Successfully",
        userId  : req.userId
    })
})
router.get('/profile', protect , getProfileController)
router.put('/profile', protect , updateProfileController)
router.post('/refresh-token' , refreshAccessTokenController)
router.post('/logout' , LogoutUserController)
export default router;