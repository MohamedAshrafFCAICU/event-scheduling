const express = require("express");
const router = express.Router();
const container = require("../config/container");
const authMiddleware = require("../middleware/auth.middleware");
const {
  createEventValidation,
  searchEventsValidation,
  inviteUserValidation,
  eventIdValidation,
  responseStatusValidation,
  validate,
} = require("../validators/event.validator");

const eventController = container.resolve("EventController");

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (requires authentication)
 */
router.post(
  "/",
  authMiddleware.authenticate,
  createEventValidation,
  validate,
  eventController.createEvent
);

/**
 * @route   POST /api/events/:eventId/invite
 * @desc    Invite a user to an event
 * @access  Private (requires authentication + organizer/collaborator role)
 */
router.post(
  "/:eventId/invite",
  authMiddleware.authenticate,
  inviteUserValidation,
  validate,
  eventController.inviteUser
);

/**
 * @route   DELETE /api/events/:eventId
 * @desc    Delete (cancel) an event
 * @access  Private (requires authentication + organizer role only)
 */
router.delete(
  "/:eventId",
  authMiddleware.authenticate,
  eventIdValidation,
  validate,
  eventController.deleteEvent
);

/**
 * @route   GET /api/events/organizer
 * @desc    Get all events organized by the current user
 * @access  Private
 */
router.get(
  "/organizer",
  authMiddleware.authenticate,
  eventController.getOrganizerEvents
);

/**
 * @route   GET /api/events/invited
 * @desc    Get all events the current user is invited to
 * @access  Private
 */
router.get(
  "/invited",
  authMiddleware.authenticate,
  eventController.getInvitedEvents
);

/**
 * @route   GET /api/events/:eventId/participants
 * @desc    Get all participants for a specific event
 * @access  Private
 */
router.get(
  "/:eventId/participants",
  authMiddleware.authenticate,
  eventIdValidation,
  validate,
  eventController.getEventParticipants
);

/**
 * @route   GET /api/events/search
 * @desc    Search events with filters
 * @access  Private
 * @query   keyword, startDate, endDate, status, role, userId, limit, offset
 */
router.get(
  "/search",
  authMiddleware.authenticate,
  searchEventsValidation,
  validate,
  eventController.searchEvents
);

router.put(
  "/:eventId/response",
  authMiddleware.authenticate,
  eventIdValidation,
  responseStatusValidation,
  validate,
  eventController.updateEventStatus
);



module.exports = router;
