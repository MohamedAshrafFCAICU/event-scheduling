const { Role, ResponseStatus } = require("./enums");

class EventParticipantEntity {
  constructor(data) {
    this.userId = data.user_id || data.userId;
    this.eventId = data.event_id || data.eventId;

    // Use enums with validation
    this.role = data.role ? Role.parse(data.role) : Role.getDefault();

    this.status =
      data.status || data.response_status || data.responseStatus
        ? ResponseStatus.parse(
            data.status || data.response_status || data.responseStatus
          )
        : ResponseStatus.getDefault();

    this.invitedAt = new Date(data.invited_at || data.invitedAt || Date.now());
    this.respondedAt = data.responded_at ? new Date(data.responded_at) : null;
  }

  // Role checks
  isOrganizer() {
    return this.role === Role.ORGANIZER;
  }

  isCollaborator() {
    return this.role === Role.COLLABORATOR;
  }

  isAttendee() {
    return this.role === Role.ATTENDEE;
  }

  canManageEvent() {
    return Role.canManageEvent(this.role);
  }

  canInviteOthers() {
    return Role.canInviteOthers(this.role);
  }

  canDeleteEvent() {
    return Role.canDeleteEvent(this.role);
  }

  // Response checks (status)
  isPending() {
    return this.status === ResponseStatus.PENDING;
  }

  isGoing() {
    return this.status === ResponseStatus.GOING;
  }

  isMaybe() {
    return this.status === ResponseStatus.MAYBE;
  }

  isNotGoing() {
    return this.status === ResponseStatus.NOT_GOING;
  }

  hasResponded() {
    return (
      ResponseStatus.hasResponded(this.status) && this.respondedAt !== null
    );
  }

  // Response actions
  respondGoing() {
    this.status = ResponseStatus.GOING;
    this.respondedAt = new Date();
  }

  respondMaybe() {
    this.status = ResponseStatus.MAYBE;
    this.respondedAt = new Date();
  }

  respondNotGoing() {
    this.status = ResponseStatus.NOT_GOING;
    this.respondedAt = new Date();
  }

  toDTO() {
    return {
      userId: this.userId,
      eventId: this.eventId,
      role: this.role,
      status: this.status,
      invitedAt: this.invitedAt,
      respondedAt: this.respondedAt,
      hasResponded: this.hasResponded(),
      permissions: {
        canManageEvent: this.canManageEvent(),
        canInviteOthers: this.canInviteOthers(),
        canDeleteEvent: this.canDeleteEvent(),
      },
    };
  }

  toDatabase() {
    return {
      user_id: this.userId,
      event_id: this.eventId,
      role: this.role,
      status: this.status,
      invited_at: this.invitedAt,
      responded_at: this.respondedAt,
    };
  }
}

module.exports = EventParticipantEntity;
