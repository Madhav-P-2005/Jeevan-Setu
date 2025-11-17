// jeevansetu-backend/src/controllers/donationController.js

import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { BLOOD_GROUPS, DONATION_STATUS_VALUES } from "../constants/domain.js";

const STATUS_SET = new Set(DONATION_STATUS_VALUES);
const BLOOD_GROUP_SET = new Set(BLOOD_GROUPS);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const logDonation = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role bloodGroup");
    if (!user || user.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can log donations",
      });
    }

    const {
      requestId,
      recipientId,
      bloodGroup,
      quantityDonated,
      dateOfDonation,
      location,
      status,
      notes,
      followUpNotes,
    } = req.body || {};

    if (!recipientId || !bloodGroup || !location) {
      return res.status(400).json({
        success: false,
        message: "recipientId, bloodGroup, and location are required",
      });
    }

    if (!isValidObjectId(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipientId",
      });
    }

    const recipient = await User.findById(recipientId).select("role");
    if (!recipient || recipient.role !== "recipient") {
      return res.status(400).json({
        success: false,
        message: "Recipient must be a registered recipient",
      });
    }

    if (!BLOOD_GROUP_SET.has(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    if (status && !STATUS_SET.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    let resolvedRequest = null;
    if (requestId) {
      if (!isValidObjectId(requestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid requestId",
        });
      }

      resolvedRequest = await Request.findById(requestId);
      if (!resolvedRequest) {
        return res.status(404).json({
          success: false,
          message: "Linked request not found",
        });
      }

      const canLogFromRequest =
        resolvedRequest.matchedDonor?.toString() === req.userId ||
        resolvedRequest.requestedBy?.toString() === req.userId;

      if (!canLogFromRequest) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to log donation for this request",
        });
      }
    }

    const donationData = {
      donor: req.userId,
      request: resolvedRequest?._id || null,
      recipient: recipientId,
      bloodGroup,
      quantityDonated: quantityDonated || null,
      location: location.trim(),
      notes: notes?.trim() || "",
      followUpNotes: followUpNotes?.trim() || "",
      status: status || "completed",
    };

    if (dateOfDonation) {
      const donationDate = new Date(dateOfDonation);
      if (Number.isNaN(donationDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid dateOfDonation",
        });
      }
      donationData.dateOfDonation = donationDate;
    }

    const donation = await Donation.create(donationData);

    if (resolvedRequest) {
      resolvedRequest.status = "fulfilled";
      resolvedRequest.fulfilledOn = new Date();
      await resolvedRequest.save();
    }

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { donationHistory: donation._id },
      $set: { lastDonationAt: donation.dateOfDonation },
    });

    return res.status(201).json({
      success: true,
      data: { donation },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const listMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.userId })
      .sort({ dateOfDonation: -1 })
      .limit(50)
      .populate("recipient", "name city state country bloodGroup role")
      .populate("request", "patientName location bloodGroup status");

    return res.status(200).json({
      success: true,
      data: { donations },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
