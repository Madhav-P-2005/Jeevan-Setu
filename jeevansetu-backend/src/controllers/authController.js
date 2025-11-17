// jeevansetu-backend/src/controllers/authController.js

import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import generateTokens from "../utils/generateTokens.js";
import sendEmail, {
  buildVerificationEmail,
  buildPasswordResetEmail,
} from "../utils/sendEmail.js";

// Register New User Controller
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      bloodGroup,
      available,
      country,
      phone,
      city,
      state,
      message,
      lastDonationAt,
      addressLine1,
      addressLine2,
      postalCode,
      address,
      instagram,
      x,
      facebook,
    } = req.body;

    // Normalize and trim inputs
    const emailNorm = (email || "").toLowerCase().trim();
    const nameTrim = (name || "").trim();
    const cityTrim = (city || "").trim();
    const addressLine1Trim = (addressLine1 || "").trim();
    const addressLine2Trim = (addressLine2 || "").trim();
    const postalCodeTrim = (postalCode || "").trim();
    const addressTrim = (address || "").trim();
    const instagramTrim = (instagram || "").trim();
    const xTrim = (x || "").trim();
    const facebookTrim = (facebook || "").trim();
    const stateTrim = (state || "").trim();
    const countryTrim = (country || "").trim();
    const messageTrim = (message || "").trim();
    const phoneTrim = (phone || "").trim();
    const roleNorm = (role || "donor").trim();

    // 1) Basic Validation
    if (!nameTrim || !emailNorm || !password) {
      return res.status(400).json({
        success: false,
        message: "Name , email , and password are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 1e) phone validation (required)
    if (!phoneTrim) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }
    if (!/^\d{10}$/.test(phoneTrim)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits long",
      });
    }

    // 1b) bloodGroup validation (enum)
    const allowedGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!bloodGroup || !allowedGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid bloodGroup is required (A+, A-, B+, B-, AB+, AB-, O+, O-)",
      });
    }

    // 1c) role validation (enum)
    const allowedRoles = ["donor", "recipient"];
    if (roleNorm && !allowedRoles.includes(roleNorm)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (donor, recipient)",
      });
    }

    // 1d) lastDonationAt validation (optional)
    let lastDonationAtDate = null;
    if (lastDonationAt) {
      const d = new Date(lastDonationAt);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid lastDonationAt date",
        });
      }
      lastDonationAtDate = d;
    }

    // 2) Check duplicate
    if (await User.exists({ email: emailNorm })) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3) Generate OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await crypto
      .createHash("sha256")
      .update(rawOtp)
      .digest("hex");
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4) Create User (model pre-save will hash password)
    const user = await User.create({
      name: nameTrim,
      email: emailNorm,
      password,
      role: roleNorm,
      bloodGroup,
      available,
      country: countryTrim,
      phone: phoneTrim,
      city: cityTrim,
      state: stateTrim,
      message: messageTrim,
      address: {
        line1: addressTrim || addressLine1Trim,
        line2: addressLine2Trim,
        postalCode: postalCodeTrim,
      },
      social: {
        instagram: instagramTrim,
        x: xTrim,
        facebook: facebookTrim,
      },
      lastDonationAt: lastDonationAtDate,
      isEmailVerified: false,
      emailVerification: {
        otpHash,
        expiresAt: otpExpires,
        attempts: 0,
        lastSentAt: new Date(),
      },
    });

    const verificationEmail = buildVerificationEmail({
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });
    await sendEmail({
      to: user.email,
      subject: "JeevanSetu – Verify your email",
      ...verificationEmail,
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify the OTP sent to your email.",
    });
  } catch (error) {
    // Central error shape
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Login User Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailNorm = (email || "").toLowerCase().trim();

    // 1) Basic Validation
    if (!emailNorm || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2) Find user by email

    const user = await User.findOne({ email: emailNorm }).select(
      "+password isEmailVerified emailVerification.expiresAt emailVerification.attempts emailVerification.lastSentAt +emailVerification.otpHash"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3) Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Email not verified. Please verify the OTP sent to your email.",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
          available: user.available,
          country: user.country,
          phone: user.phone,
          city: user.city,
          state: user.state,
          message: user.message,
          address: user.address,
          social: user.social,
          lastDonationAt: user.lastDonationAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const emailNorm = (email || "").toLowerCase().trim();
    const otpTrim = (otp || "").trim();

    if (!emailNorm || !otpTrim) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email: emailNorm }).select(
      "isEmailVerified emailVerification.expiresAt emailVerification.attempts +emailVerification.otpHash"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(200)
        .json({ success: true, message: "Email already verified" });
    }

    const verification = user.emailVerification || {};
    if (!verification.otpHash) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not generated. Please resend." });
    }

    if (
      verification.expiresAt &&
      verification.expiresAt.getTime() < Date.now()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP expired. Please request a new one.",
        });
    }

    const providedHash = crypto
      .createHash("sha256")
      .update(otpTrim)
      .digest("hex");
    if (providedHash !== verification.otpHash) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { "emailVerification.attempts": 1 } }
      );
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          "emailVerification.verifiedAt": new Date(),
        },
        $unset: {
          "emailVerification.otpHash": "",
          "emailVerification.expiresAt": "",
          "emailVerification.attempts": "",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const details = Object.values(error.errors || {}).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: details[0] || "Invalid profile data",
        details,
      });
    }

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A profile with this email or phone already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const emailNorm = (email || "").toLowerCase().trim();
    if (!emailNorm) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: emailNorm }).select(
      "isEmailVerified emailVerification.lastSentAt"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(200)
        .json({ success: true, message: "Email already verified" });
    }

    const now = Date.now();
    const lastSent = user.emailVerification?.lastSentAt?.getTime() || 0;
    if (now - lastSent < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message:
          "OTP already sent recently. Please wait a minute before requesting again.",
      });
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");
    const otpExpires = new Date(now + 10 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          "emailVerification.otpHash": otpHash,
          "emailVerification.expiresAt": otpExpires,
          "emailVerification.attempts": 0,
          "emailVerification.lastSentAt": new Date(),
        },
      }
    );

    const verificationEmail = buildVerificationEmail({
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });
    await sendEmail({
      to: emailNorm,
      subject: "JeevanSetu – Your new verification code",
      ...verificationEmail,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const emailNorm = (email || "").toLowerCase().trim();
    if (!emailNorm) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: emailNorm }).select(
      "name email passwordReset.requestedAt"
    );

    // Return success even if user not found to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email is registered, password reset instructions have been sent.",
      });
    }

    const now = Date.now();
    const lastRequested = user.passwordReset?.requestedAt?.getTime() || 0;
    if (now - lastRequested < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message:
          "Password reset already requested recently. Please wait a minute before trying again.",
      });
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");

    const expiresAt = new Date(now + 10 * 60 * 1000); // 10 minutes

    user.passwordReset = {
      otpHash,
      expiresAt,
      requestedAt: new Date(),
      attempts: 0,
    };

    await user.save({ validateBeforeSave: false });

    const resetEmail = buildPasswordResetEmail({
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "JeevanSetu – Reset your password",
        ...resetEmail,
      });
    } catch (emailError) {
      user.passwordReset = {
        otpHash: null,
        expiresAt: null,
        requestedAt: null,
        attempts: 0,
      };
      await user.save({ validateBeforeSave: false });
      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message:
        "If that email is registered, an OTP has been sent to reset your password.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const emailNorm = (email || "").toLowerCase().trim();
    const otpTrim = (otp || "").trim();
    const passwordRaw = password || "";

    if (!emailNorm || !otpTrim || !passwordRaw) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (passwordRaw.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({ email: emailNorm }).select(
      "+password passwordReset.expiresAt passwordReset.requestedAt passwordReset.attempts +passwordReset.otpHash"
    );

    if (!user || !user.passwordReset?.otpHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset OTP",
      });
    }

    if (
      user.passwordReset.expiresAt &&
      user.passwordReset.expiresAt.getTime() < Date.now()
    ) {
      user.passwordReset.otpHash = null;
      user.passwordReset.expiresAt = null;
      user.passwordReset.requestedAt = null;
      user.passwordReset.attempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "Reset OTP has expired. Please request a new one.",
      });
    }

    if (user.passwordReset.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many invalid attempts. Please request a new OTP.",
      });
    }

    const providedHash = crypto
      .createHash("sha256")
      .update(otpTrim)
      .digest("hex");
    if (providedHash !== user.passwordReset.otpHash) {
      user.passwordReset.attempts = (user.passwordReset.attempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "Invalid reset OTP",
      });
    }

    user.password = passwordRaw;
    user.passwordReset.otpHash = null;
    user.passwordReset.expiresAt = null;
    user.passwordReset.requestedAt = null;
    user.passwordReset.attempts = 0;

    await user.save();

    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const refreshAccessTokenController = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const { accessToken, refreshToken } = generateTokens(payload.id);

    // Set rotated Refresh cookie (same options you used in register/login)

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,

      // path : "/api/auth",
    });

    // Return new access token only
    return res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

// Logout Controller
export const LogoutUserController = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User Logged Out Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to logout user",
    });
  }
};

// Update Profile Controller (partial updates)
export const updateProfileController = async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      state,
      country,
      message,
      available,
      bloodGroup,
      // last donation date (optional)
      lastDonationAt,
      // address can be provided as a single string
      address,
      // or legacy fields
      addressLine1,
      addressLine2,
      postalCode,
      // social
      instagram,
      x,
      facebook,
    } = req.body;

    const allowedGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const update = { $set: {} };

    // helper
    const setIfString = (path, val) => {
      if (typeof val === "string") update.$set[path] = val.trim();
    };

    // Personal details
    setIfString("name", name);
    setIfString("phone", phone);
    setIfString("city", city);
    setIfString("state", state);
    setIfString("country", country);
    setIfString("message", message);
    if (typeof available === "boolean") update.$set.available = available;
    if (typeof bloodGroup === "string" && allowedGroups.includes(bloodGroup)) {
      update.$set.bloodGroup = bloodGroup;
    }

    // lastDonationAt: allow null to clear, or a valid date string/ISO to set
    if (lastDonationAt !== undefined) {
      if (
        lastDonationAt === null ||
        (typeof lastDonationAt === "string" && lastDonationAt.trim() === "")
      ) {
        update.$set.lastDonationAt = null;
      } else {
        const d = new Date(lastDonationAt);
        if (isNaN(d.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid lastDonationAt date",
          });
        }
        update.$set.lastDonationAt = d;
      }
    }

    // Address: map single string to address.line1; keep legacy fields
    setIfString("address.line1", address);
    setIfString("address.line1", addressLine1);
    setIfString("address.line2", addressLine2);
    setIfString("address.postalCode", postalCode);

    // Social links
    setIfString("social.instagram", instagram);
    setIfString("social.x", x);
    setIfString("social.facebook", facebook);

    if (Object.keys(update.$set).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid update fields provided",
      });
    }

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
      fields:
        "name email role bloodGroup city state country phone message available lastDonationAt createdAt updatedAt donationHistory address social",
    }).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
          available: user.available,
          country: user.country,
          phone: user.phone,
          city: user.city,
          state: user.state,
          message: user.message,
          address: user.address,
          social: user.social,
          lastDonationAt: user.lastDonationAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          donationHistory: user.donationHistory,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Dashboard Controller
export const getProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select(
        "name email role bloodGroup city state country phone message available lastDonationAt createdAt updatedAt donationHistory address social"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
          available: user.available,
          country: user.country,
          phone: user.phone,
          city: user.city,
          state: user.state,
          message: user.message,
          address: user.address,
          social: user.social,
          lastDonationAt: user.lastDonationAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          donationHistory: user.donationHistory,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
