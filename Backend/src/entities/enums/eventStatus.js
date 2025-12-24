class EventStatus {
  static ACTIVE = "Active";
  static CANCELLED = "Cancelled";
  static POSTPONED = "Postponed";

  static values() {
    return [EventStatus.ACTIVE, EventStatus.CANCELLED, EventStatus.POSTPONED];
  }

  static isValid(status) {
    return EventStatus.values().includes(status);
  }

  static getDefault() {
    return EventStatus.ACTIVE;
  }

  static parse(status) {
    if (!status) return EventStatus.getDefault();

    const upperStatus = status.toUpperCase();

    switch (upperStatus) {
      case "ACTIVE":
        return EventStatus.ACTIVE;
      case "CANCELLED":
      case "CANCELED":
      case "DELETED":
        return EventStatus.CANCELLED;
      case "POSTPONED":
        return EventStatus.POSTPONED;
      default:
        throw new Error(`Invalid event status: ${status}`);
    }
  }
}

// Freeze to prevent modifications
Object.freeze(EventStatus);

module.exports = EventStatus;
