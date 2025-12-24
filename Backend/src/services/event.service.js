const EventEntity = require("../entities/event.entity");
const EventParticipantEntity = require("../entities/eventParticipant.entity");
const { EventStatus, Role, ResponseStatus } = require("../entities/enums");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require("../errors/http-errors");

class EventService {
  constructor(eventRepository, eventParticipantRepository, userRepository) {
    this.eventRepository = eventRepository;
    this.eventParticipantRepository = eventParticipantRepository;
    this.userRepository = userRepository;
  }

  async createEvent(userId, createEventDto) {
    const eventEntity = new EventEntity({
      title: createEventDto.title,
      description: createEventDto.description,
      date: createEventDto.date,
      time: createEventDto.time,
      location: createEventDto.location,
      status: EventStatus.ACTIVE,
      userId: userId,
    });

    const createdEvent = await this.eventRepository.create(eventEntity);

    const organizerParticipant = new EventParticipantEntity({
      userId: userId,
      eventId: createdEvent.id,
      role: Role.ORGANIZER,
      status: ResponseStatus.GOING,
    });

    await this.eventParticipantRepository.create(organizerParticipant);

    return {
      event: createdEvent.toDTO(),
      organizer: organizerParticipant.toDTO(),
    };
  }

  async inviteUser(organizerId, invitationDto) {
    const { eventId, userId, role } = invitationDto;

    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (!event.isActive()) {
      throw new BadRequestError(
        "Cannot invite users to a cancelled or postponed event"
      );
    }

    const organizerParticipation =
      await this.eventParticipantRepository.findByUserAndEvent(
        organizerId,
        eventId
      );

    if (!organizerParticipation) {
      throw new ForbiddenError("You are not a participant of this event");
    }

    if (!organizerParticipation.canInviteOthers()) {
      throw new ForbiddenError(
        "You don't have permission to invite users to this event"
      );
    }

    const invitedUser = await this.userRepository.findById(userId);
    if (!invitedUser) {
      throw new NotFoundError("User to be invited not found");
    }

    const existingParticipation =
      await this.eventParticipantRepository.findByUserAndEvent(userId, eventId);

    if (existingParticipation) {
      throw new ConflictError("User is already invited to this event");
    }

    if (role === Role.ORGANIZER) {
      throw new BadRequestError(
        "Cannot invite another organizer. An event can only have one organizer."
      );
    }

    const invitation = new EventParticipantEntity({
      userId: userId,
      eventId: eventId,
      role: role,
      status: ResponseStatus.PENDING,
    });

    const createdInvitation = await this.eventParticipantRepository.create(
      invitation
    );

    return {
      invitation: createdInvitation.toDTO(),
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
      },
      invitedUser: {
        id: invitedUser.id,
        username: invitedUser.username,
        email: invitedUser.email,
        fullName: invitedUser.getFullName(),
      },
      invitedBy: {
        id: organizerId,
        role: organizerParticipation.role,
      },
    };
  }

  async deleteEvent(userId, eventId) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (event.isCancelled()) {
      throw new BadRequestError("Event is already cancelled");
    }

    const userParticipation =
      await this.eventParticipantRepository.findByUserAndEvent(userId, eventId);

    if (!userParticipation) {
      throw new ForbiddenError("You are not a participant of this event");
    }

    if (!userParticipation.canDeleteEvent()) {
      throw new ForbiddenError("Only the event organizer can delete the event");
    }

    event.cancel();
    const updatedEvent = await this.eventRepository.update(eventId, event);

    const participants = await this.eventParticipantRepository.findByEventId(
      eventId
    );

    return {
      event: updatedEvent.toDTO(),
      deletedBy: {
        id: userId,
        role: userParticipation.role,
      },
      affectedParticipants: participants.length,
      participants: participants.map((p) => ({
        userId: p.userId,
        role: p.role,
        status: p.status,
      })),
    };
  }

  async getOrganizerEvents(organizerId) {
    try {

      const eventsData = await this.eventParticipantRepository.getAllEventsCreatedByOrganizer(organizerId);
      if (!eventsData || eventsData.length === 0) {
        throw new NotFoundError("You have not organized any events yet");
      }
      return { eventsData: eventsData.map(event => event.toDTO()) };

    } catch (error) {
      throw new NotFoundError("Error while retrieving organizer events " + error.message);
    }
  };

  async getInvitedEvents(userId) {
    try {
      const eventsData = await this.eventParticipantRepository.getAllEventsInvitedTo(userId);

      if (!eventsData || eventsData.length === 0) {
        return { eventsData: [] };
      }

      return { eventsData: eventsData };

    } catch (error) {
      throw new NotFoundError("Error while retrieving invited events: " + error.message);
    }
  }

  async getEventParticipants(eventId, requestingUserId) {
    try {
      const participantsData = await this.eventParticipantRepository.getAllUsersInEvent(eventId, requestingUserId);
      if (!participantsData || participantsData.length === 0) {
        throw new NotFoundError("No participants found for this event or you do not have access to view them");
      }
      return { participantsData };
    }
    catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error("An unexpected error occurred while retrieving event participants " + error.message);
    }
  }

  async searchEvents(filters) {
    try {
      const sanitizedFilters = {
        keyword: filters.keyword,
        date: filters.date,
        userStatus: filters.userStatus,
        eventStatus: filters.eventStatus,
        role: filters.role,
        userId: filters.userId,
        limit: parseInt(filters.limit) || 20,
        offset: parseInt(filters.offset) || 0
      };

      const results = await this.eventRepository.search(sanitizedFilters);

      if (!results || results.length === 0) {
        return {
          events: [],
          pagination: {
            total: 0,
            limit: sanitizedFilters.limit,
            offset: sanitizedFilters.offset,
            hasMore: false
          }
        };
      }

      const totalCount = results[0]?.total_count || 0;
      const events = results.map(event => {
        const { total_count, ...eventData } = event;
        return eventData;
      });

      return {
        events,
        pagination: {
          total: totalCount,
          limit: sanitizedFilters.limit,
          offset: sanitizedFilters.offset,
          hasMore: (sanitizedFilters.offset + sanitizedFilters.limit) < totalCount
        }
      };

    } catch (error) {
      throw new Error("An unexpected error occurred while searching events " + error.message);
    }
  }


  async updateEventResponse(userId, eventId, responseStatus) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.isCancelled()) {
      throw new BadRequestError('Cannot respond to a cancelled event');
    }

    const participant = await this.eventParticipantRepository.findByUserAndEvent(
      userId,
      eventId
    );

    if (!participant) {
      throw new ForbiddenError('You are not invited to this event');
    }


    const updatedParticipant = await this.eventParticipantRepository.updateResponseStatus(
      userId,
      eventId,
      responseStatus
    );

    if (!updatedParticipant) {
      throw new Error('Failed to update response status');
    }

    return {
      participant: updatedParticipant.toDTO(),
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
      },
      message: `Response updated to: ${updatedParticipant.status}`,
    };
  }

}

module.exports = EventService;
