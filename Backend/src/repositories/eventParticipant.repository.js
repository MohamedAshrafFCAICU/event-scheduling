const BaseRepository = require("./base.repository");
const EventParticipantEntity = require("../entities/eventParticipant.entity");
const UserEntity = require("../entities/user.entity");
const EventEntity = require("../entities/event.entity");

class EventParticipantRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = "event_participants";
  }

  async create(participantEntity) {
    const query = `
      INSERT INTO ${this.tableName}
        (user_id, event_id, role, status, invited_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, event_id, role, status, invited_at, responded_at
    `;

    const values = [
      participantEntity.userId,
      participantEntity.eventId,
      participantEntity.role,
      participantEntity.status,
      participantEntity.invitedAt,
    ];

    const result = await this.db.query(query, values);
    return new EventParticipantEntity(result.rows[0]);
  }

  async findByEventId(eventId) {
    const query = `
      SELECT user_id, event_id, role, status, invited_at, responded_at
      FROM ${this.tableName}
      WHERE event_id = $1
      ORDER BY role ASC, invited_at DESC
    `;

    const result = await this.db.query(query, [eventId]);
    return result.rows.map((row) => new EventParticipantEntity(row));
  }

  async findByUserId(userId) {
    const query = `
      SELECT user_id, event_id, role, status, invited_at, responded_at
      FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY invited_at DESC
    `;

    const result = await this.db.query(query, [userId]);
    return result.rows.map((row) => new EventParticipantEntity(row));
  }

  async findByUserAndEvent(userId, eventId) {
    const query = `
      SELECT user_id, event_id, role, status, invited_at, responded_at
      FROM ${this.tableName}
      WHERE user_id = $1 AND event_id = $2
    `;

    const result = await this.db.query(query, [userId, eventId]);

    if (result.rows.length === 0) {
      return null;
    }

    return new EventParticipantEntity(result.rows[0]);
  }

  async delete(userId, eventId) {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE user_id = $1 AND event_id = $2
      RETURNING user_id, event_id
    `;

    const result = await this.db.query(query, [userId, eventId]);
    return result.rows.length > 0;
  }

  async getAllEventsCreatedByOrganizer(organizerId) {
    const query = `
    SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.status,
          e.user_id, e.created_at, e.updated_at
    FROM events e
    JOIN ${this.tableName} ep ON e.id = ep.event_id
    WHERE ep.user_id = $1 
    AND ep.role = 'Organizer'
    ORDER BY e.date ASC, e.time ASC
  `;
    const result = await this.db.query(query, [organizerId]);
    return result.rows.map((row) => new EventEntity(row));
  }

  // modified ep.status to e.status
  async getAllEventsInvitedTo(userId) {
    try {
      // Join the event_participants table with the events table
      const query = `
            SELECT 
                e.*,
                ep.role as participant_role,
                ep.status as participant_status,
                ep.invited_at,
                ep.responded_at,
                e.status 
            FROM event_participants ep
            INNER JOIN events e ON ep.event_id = e.id
            WHERE ep.user_id = $1 AND ep.role != 'Organizer'
            ORDER BY ep.invited_at DESC
        `;

      const result = await this.db.query(query, [userId]);


      // Map to event objects with participant info
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        time: row.time,
        location: row.location,
        status: row.status,
        userId: row.user_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        participantStatus: row.participant_status,
        participantRole: row.participant_role,
        invitedAt: row.invited_at,
        respondedAt: row.responded_at,
        hasResponded: row.has_responded
      }));

    } catch (error) {
      throw new Error("Error fetching invited events: " + error.message);
    }
  }

  async getAllUsersInEvent(eventId, requestingUserId) {
    const permissionQuery = `
    SELECT ep.role, e.user_id as event_creator_id
    FROM ${this.tableName} ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.event_id = $1 AND ep.user_id = $2
  `;
    const permissionResult = await this.db.query(permissionQuery, [eventId, requestingUserId]);

    if (permissionResult.rows.length === 0) {
      throw new Error('Event not found or you are not a participant');
    }

    const participant = permissionResult.rows[0];
    const isEventCreator = participant.event_creator_id === requestingUserId;
    const isCollaborator = participant.role === 'Collaborator';

    if (!isEventCreator && !isCollaborator) {
      throw new UnauthorizedError('Insufficient permissions to view participants');
    }

    const query = `
    SELECT 
      u.id as user_id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      ep.event_id,
      ep.role,
      ep.status,
      ep.invited_at,
      ep.responded_at
    FROM users u
    JOIN ${this.tableName} ep ON u.id = ep.user_id
    WHERE ep.event_id = $1
    ORDER BY 
      CASE ep.role
        WHEN 'Organizer' THEN 1
        WHEN 'Collaborator' THEN 2
        WHEN 'Attendee' THEN 3
      END,
      ep.invited_at ASC
  `;

    const results = await this.db.query(query, [eventId]);
    return results.rows.map((row) => ({
      userId: row.user_id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      eventId: row.event_id,
      role: row.role,
      status: row.status,
      invitedAt: row.invited_at,
      respondedAt: row.responded_at
    }));
  }

  async updateResponseStatus(userId, eventId, responseStatus) {
    const query = `
    UPDATE ${this.tableName}
    SET status = $1, responded_at = $2 
    WHERE user_id = $3 AND event_id = $4
    RETURNING user_id, event_id, role, status, invited_at, responded_at
  `;

    const result = await this.db.query(query, [
      responseStatus,
      new Date(),
      userId,
      eventId
    ]);

    if (result.rows.length === 0) {
      return null;
    }


    return new EventParticipantEntity(result.rows[0]);
  }

}

module.exports = EventParticipantRepository;
