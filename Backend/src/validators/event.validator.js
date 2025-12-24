const { body, param, validationResult, query } = require("express-validator");
const { Role, ResponseStatus } = require("../entities/enums");


const responseStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Response status is required")
    .isIn(ResponseStatus.values())
    .withMessage(
      `Status must be one of: ${ResponseStatus.values().join(", ")}`
    )
    .custom((value) => {
      if (value === ResponseStatus.PENDING) {
        throw new Error("Cannot set response status to Pending");
      }
      return true;
    }),
];


// ============================================
// Create Event Validation
// ============================================
const createEventValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Event title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Event description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("date")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD)")
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),

  body("time")
    .notEmpty()
    .withMessage("Event time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage("Invalid time format (use HH:MM:SS)"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Event location is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Location must be between 3 and 255 characters"),
];

// ============================================
// ✅ NEW: Invite User to Event Validation
// ============================================
const inviteUserValidation = [
  param("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer")
    .toInt(),

  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer")
    .toInt(),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Role.values())
    .withMessage(`Role must be one of: ${Role.values().join(", ")}`),
];

// ============================================
// Event ID Parameter Validation
// ============================================
const eventIdValidation = [
  param("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isInt({ min: 1 })
    .withMessage("Event ID must be a positive integer")
    .toInt(),
];

const searchEventsValidation = [
  query("keyword")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Keyword must be between 2 and 100 characters"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format (use YYYY-MM-DD)"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format (use YYYY-MM-DD)")
    .custom((endDate, { req }) => {
      if (req.query.startDate && endDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (start > end) {
          throw new Error("End date must be after start date");
        }
      }
      return true;
    }),

  query("status")
    .optional()
    .isIn(ResponseStatus.values())
    .withMessage(`Status must be one of: ${ResponseStatus.values().join(", ")}`),

  query("role")
    .optional()
    .isIn(Role.values())
    .withMessage(`Role must be one of: ${Role.values().join(", ")}`),

  query("userId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer")
    .toInt(),
];


// ============================================
// Validation Result Handler
// ============================================
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = {
  createEventValidation,
  searchEventsValidation,
  inviteUserValidation,
  responseStatusValidation,
  eventIdValidation,
  validate,
};
