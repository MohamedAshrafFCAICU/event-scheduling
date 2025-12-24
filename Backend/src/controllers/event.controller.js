const { validationResult } = require("express-validator");
const CreateEventDto = require("../dtos/requests/createEvent.dto");
const CreateEventInvitationDto = require("../dtos/requests/createEventInvitation.dto");

class EventController {
  constructor(eventService) {
    this.eventService = eventService;
  }

  createEvent = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const createEventDto = CreateEventDto.fromRequest(req);
      const result = await this.eventService.createEvent(
        userId,
        createEventDto
      );

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  inviteUser = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const organizerId = req.user.id;
      const invitationDto = CreateEventInvitationDto.fromRequest(req);
      const result = await this.eventService.inviteUser(
        organizerId,
        invitationDto
      );

      return res.status(201).json({
        success: true,
        message: "User invited successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const eventId = parseInt(req.params.eventId);

      const result = await this.eventService.deleteEvent(userId, eventId);

      return res.status(200).json({
        success: true,
        message: "Event deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

getOrganizerEvents = async (req, res, next) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
                });
            }

            const organizerId = req.user.id;
            const result = await this.eventService.getOrganizerEvents(organizerId);
            return res.status(200).json({
                success: true,
                message: "Organizer events retrieved successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getInvitedEvents = async (req, res, next) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
                });
            }

            const userId = req.user.id;
            const result = await this.eventService.getInvitedEvents(userId);
            return res.status(200).json({
                success: true,
                message: "Invited events retrieved successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getEventParticipants = async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
                });
            }

            const eventId = req.params.eventId;
            const requestingUserId = req.user.id;
            const result = await this.eventService.getEventParticipants(eventId, requestingUserId);
            return res.status(200).json({
                success: true,
                message: "Event participants retrieved successfully",
                data: result,
            });
        } catch (error) {
        next(error);
     }
    }

  searchEvents = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      if (req.query.userId || req.query.user_id) {
        return res.status(400).json({
          success: false,
          message: "You cannot specify userId in search. Search is limited to your own events.",
          statusCode: 400
        });
      }

      const filters = {
        keyword: req.query.keyword || req.query.q,
        date: req.query.date,
        userStatus: req.query.userStatus,
        eventStatus: req.query.eventStatus,
        role: req.query.role,
        userId: req.user.id
      };

      const result = await this.eventService.searchEvents(filters);

      return res.status(200).json({
        success: true,
        data: result.events,
        pagination: result.pagination,
        ...(filters.keyword && { searchTerm: filters.keyword })
      });

    } catch (error) {
      next(error);
    }
  };


  updateEventStatus = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      const userId = req.user.id;
      const eventId = parseInt(req.params.eventId);
      const status  = req.body.status;
      const result = await this.eventService.updateEventResponse(
        userId,
        eventId,
        status
      );
      return res.status(200).json({
        success: true,
        message: "Event response updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

}   
module.exports = EventController;
