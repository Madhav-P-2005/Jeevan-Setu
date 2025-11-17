// jeevansetu-backend/src/controllers/requestController.js

import mongoose from "mongoose";
import Request from "../models/Request.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import {
  BLOOD_GROUPS,
  REQUEST_STATUS_VALUES,
  REQUEST_URGENCY_LEVELS,
} from "../constants/domain.js";

const REQUEST_STATUS_SET = new Set(REQUEST_STATUS_VALUES);
const URGENCY_SET = new Set(REQUEST_URGENCY_LEVELS);
const BLOOD_GROUP_SET = new Set(BLOOD_GROUPS);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createRequest = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "recipient") {
      return res.status(403).json({
        success: false,
        message: "Only recipients can create requests",
      });
    }

    const {
      patientName,
      hospitalName,
      contactPhone,
      neededBy,
      bloodGroup,
      quantityRequired,
      location,
      geo,
      urgencyLevel,
      notes,
    } = req.body || {};

    const trimmedPatientName = (patientName || "").trim();
    const trimmedHospitalName = (hospitalName || "").trim();
    const trimmedContactPhone = (contactPhone || "").trim();
    const trimmedLocation = (location || "").trim();

    if (
      !trimmedPatientName ||
      !neededBy ||
      !bloodGroup ||
      quantityRequired === undefined ||
      !trimmedLocation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "patientName, neededBy, bloodGroup, quantityRequired, and location are required",
      });
    }

    if (!BLOOD_GROUP_SET.has(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group",
      });
    }

    if (urgencyLevel && !URGENCY_SET.has(urgencyLevel)) {
      return res.status(400).json({
        success: false,
        message: "Invalid urgency level",
      });
    }

    const quantityNumber = Number(quantityRequired);
    if (!Number.isFinite(quantityNumber) || quantityNumber < 100) {
      return res.status(400).json({
        success: false,
        message: "quantityRequired must be at least 100 ml",
      });
    }

    const neededByDate = new Date(neededBy);
    if (Number.isNaN(neededByDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid neededBy date",
      });
    }

    const now = Date.now();
    if (neededByDate.getTime() < now) {
      return res.status(400).json({
        success: false,
        message: "neededBy must be a future date and time",
      });
    }

    const PHONE_REGEX = /^\+?[0-9\-()\s]{7,20}$/;
    if (trimmedContactPhone && !PHONE_REGEX.test(trimmedContactPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contactPhone",
      });
    }

    const data = {
      requestedBy: req.userId,
      patientName: trimmedPatientName,
      hospitalName: trimmedHospitalName,
      contactPhone: trimmedContactPhone,
      neededBy: neededByDate,
      bloodGroup,
      quantityRequired: quantityNumber,
      location: trimmedLocation,
      urgencyLevel: urgencyLevel || "medium",
      notes: notes?.trim() || "",
    };

    if (geo && typeof geo === "object") {
      const lat = typeof geo.lat === "number" ? geo.lat : Number(geo.lat);
      const lng = typeof geo.lng === "number" ? geo.lng : Number(geo.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        data.geo = { lat, lng };
      }
    }

    const request = await Request.create(data);

    return res.status(201).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const listRequests = async (req, res) => {
  try {
    const { status, bloodGroup, urgencyLevel, location, patient, mine, limit } =
      req.query || {};

    const filter = {};
    const mineFlag = mine === "true";

    if (status) {
      if (status !== "all" && !REQUEST_STATUS_SET.has(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }
      if (status !== "all") {
        filter.status = status;
      }
    } else if (!mineFlag) {
      filter.status = "open";
    }

    if (bloodGroup) {
      if (!BLOOD_GROUP_SET.has(bloodGroup)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blood group filter",
        });
      }
      filter.bloodGroup = bloodGroup;
    }

    if (urgencyLevel) {
      if (!URGENCY_SET.has(urgencyLevel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid urgency filter",
        });
      }
      filter.urgencyLevel = urgencyLevel;
    }

    if (mineFlag) {
      filter.requestedBy = req.userId;
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (patient) {
      filter.patientName = { $regex: patient, $options: "i" };
    }

    const limitNumber = Math.min(parseInt(limit, 10) || 20, 100);

    const requests = await Request.find(filter)
      .sort({ neededBy: 1 })
      .limit(limitNumber)
      .populate(
        "requestedBy",
        "name email phone city state country bloodGroup role social"
      )
      .populate(
        "matchedDonor",
        "name email phone city state country bloodGroup role social"
      );

    return res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const matchRequest = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role bloodGroup");
    if (!user || user.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can match requests",
      });
    }

    const request = await Request.findById(req.params.id).populate(
      "requestedBy",
      "name email phone city state country bloodGroup role social"
    );
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Request is not open for matching",
      });
    }

    if (user.bloodGroup && user.bloodGroup !== request.bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Donor blood group does not match request",
      });
    }

    request.matchedDonor = req.userId;
    request.matchedOn = new Date();
    request.status = "matched";

    await request.save();

    return res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!REQUEST_STATUS_SET.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const isOwner = request.requestedBy?.toString() === req.userId;
    const isMatchedDonor = request.matchedDonor?.toString() === req.userId;

    if (!isOwner && !isMatchedDonor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this request",
      });
    }

    if (status === "matched" && !request.matchedDonor) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark as matched without an assigned donor",
      });
    }

    request.status = status;

    if (status === "open") {
      request.matchedDonor = null;
      request.matchedOn = null;
      request.fulfilledOn = null;
    } else if (status === "fulfilled") {
      const now = new Date();
      request.fulfilledOn = now;

      // Auto-log donation history when a matched request is fulfilled
      if (request.matchedDonor && request.requestedBy) {
        try {
          const donation = await Donation.create({
            donor: request.matchedDonor,
            request: request._id,
            recipient: request.requestedBy,
            bloodGroup: request.bloodGroup,
            quantityDonated: request.quantityRequired || null,
            location: request.location,
            notes: request.notes || "",
            status: "completed",
            dateOfDonation: now,
          });

          await User.findByIdAndUpdate(request.matchedDonor, {
            $addToSet: { donationHistory: donation._id },
            $set: { lastDonationAt: donation.dateOfDonation },
          });
        } catch (e) {
          // Do not block the main status update if logging fails
          // eslint-disable-next-line no-console
          console.error("Failed to auto-log donation for fulfilled request", e);
        }
      }
    } else if (status !== "fulfilled") {
      request.fulfilledOn = null;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
