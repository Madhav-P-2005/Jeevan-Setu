// jeevansetu-backend/src/constants/domain.js

export const BLOOD_GROUPS = Object.freeze([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

export const REQUEST_URGENCY_LEVELS = Object.freeze(["low", "medium", "high"]);

export const REQUEST_STATUS_VALUES = Object.freeze([
  "open",
  "matched",
  "fulfilled",
  "cancelled",
]);

export const DONATION_STATUS_VALUES = Object.freeze(["pending", "completed", "cancelled"]);
