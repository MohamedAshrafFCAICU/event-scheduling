class CreateEventInvitationDto {
  constructor(data) {
    this.eventId = data.eventId;
    this.userId = data.userId;
    this.role = data.role;
  }

  static fromRequest(req) {
    return new CreateEventInvitationDto({
      eventId: parseInt(req.params.eventId),
      userId: parseInt(req.body.userId),
      role: req.body.role,
    });
  }

  validate() {
    const errors = [];

    if (!this.eventId || this.eventId <= 0) {
      errors.push("Valid event ID is required");
    }

    if (!this.userId || this.userId <= 0) {
      errors.push("Valid user ID is required");
    }

    if (!this.role) {
      errors.push("Role is required");
    }

    return errors;
  }
}

module.exports = CreateEventInvitationDto;
