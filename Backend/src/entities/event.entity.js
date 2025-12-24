const { EventStatus } = require("./enums");

class EventEntity {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.date = data.date ? new Date(data.date) : null;
    this.time = data.time;
    this.location = data.location;

    // Use enum with validation
    this.status = data.status
      ? EventStatus.parse(data.status)
      : EventStatus.getDefault();

    this.userId = data.user_id || data.userId; // FK to User (organizer)
    this.createdAt = new Date(data.created_at || data.createdAt || Date.now());
    this.updatedAt = new Date(data.updated_at || data.updatedAt || Date.now());
  }

  isActive() {
    return this.status === EventStatus.ACTIVE;
  }

  isCancelled() {
    return this.status === EventStatus.CANCELLED;
  }

  isPostponed() {
    return this.status === EventStatus.POSTPONED;
  }

  cancel() {
    this.status = EventStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  postpone() {
    this.status = EventStatus.POSTPONED;
    this.updatedAt = new Date();
  }

  activate() {
    this.status = EventStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  getDateTime() {
    if (!this.date || !this.time) return null;
    const dateStr = this.date.toISOString().split("T")[0];
    return new Date(`${dateStr}T${this.time}`);
  }

  toDTO() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date,
      time: this.time,
      location: this.location,
      status: this.status,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toDatabase() {
    return {
      title: this.title,
      description: this.description,
      date: this.date,
      time: this.time,
      location: this.location,
      status: this.status,
      user_id: this.userId,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

module.exports = EventEntity;
