const BaseRepository = require("./base.repository");
const EventEntity = require("../entities/event.entity");
const UserEntity = require("../entities/user.entity");
const { UnauthorizedError } = require("../errors/http-errors");


class EventRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = "events";
  }

  async findById(id) {
    const query = `
      SELECT id, title, description, date, time, location, status,
             user_id, created_at, updated_at
      FROM ${this.tableName}
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new EventEntity(result.rows[0]);
  }

  async create(eventEntity) {
    const query = `
      INSERT INTO ${this.tableName}
        (title, description, date, time, location, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, date, time, location, status,
                user_id, created_at, updated_at
    `;

    const values = [
      eventEntity.title,
      eventEntity.description,
      eventEntity.date,
      eventEntity.time,
      eventEntity.location,
      eventEntity.status,
      eventEntity.userId,
    ];

    const result = await this.db.query(query, values);
    return new EventEntity(result.rows[0]);
  }

  // ✅ Make sure this method exists
  async update(id, eventEntity) {
    const query = `
      UPDATE ${this.tableName}
      SET title = $1,
          description = $2,
          date = $3,
          time = $4,
          location = $5,
          status = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, title, description, date, time, location, status,
                user_id, created_at, updated_at
    `;

    const values = [
      eventEntity.title,
      eventEntity.description,
      eventEntity.date,
      eventEntity.time,
      eventEntity.location,
      eventEntity.status,
      id,
    ];

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return new EventEntity(result.rows[0]);
  }

  // ✅ Alternative: Direct soft delete method
  async delete(id) {
    const query = `
      UPDATE ${this.tableName}
      SET status = 'Cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, description, date, time, location, status,
                user_id, created_at, updated_at
    `;

    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new EventEntity(result.rows[0]);
  }

  async findByUserId(userId) {
    const query = `
      SELECT id, title, description, date, time, location, status,
             user_id, created_at, updated_at
      FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY date ASC, time ASC
    `;

    const result = await this.db.query(query, [userId]);
    return result.rows.map((row) => new EventEntity(row));
  }


  async search(filters = {}) {
    const {
      keyword,
      date,
      userStatus,
      eventStatus,
      userId, //Current authenticated user
    } = filters;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (!userId) {
      throw new Error('User ID is required for search');
    }

    let keywordParamIndex = null;
    if (keyword) {
      const searchTerm = keyword.trim().split(/\s+/).join(' & ');
      keywordParamIndex = paramIndex;
      params.push(searchTerm);
      paramIndex++;
    }

    let selectClause = `
    SELECT DISTINCT
      e.id,
      e.title,
      e.description,
      e.date,
      e.time,
      e.location,
      e.status,
      e.user_id,
      e.created_at,
      e.updated_at,
      ep.role as user_role,
      ep.status as user_status
  `;

    if (keyword) {
      selectClause += `,
      ts_rank(e.search_vector, to_tsquery('english', $${keywordParamIndex})) as relevance,
      ts_headline('english', e.description, to_tsquery('english', $${keywordParamIndex}), 'MaxWords=30, MinWords=15') as snippet
    `;
    }

    selectClause += `,
      COUNT(*) OVER() as total_count
  `;

    let query = `${selectClause} FROM ${this.tableName} e
    INNER JOIN event_participants ep ON e.id = ep.event_id`;

    conditions.push(`ep.user_id = $${paramIndex}`);
    params.push(userId);
    paramIndex++;

    if (keyword) {
      conditions.push(`e.search_vector @@to_tsquery('english', $${keywordParamIndex})`);
    }

    if (date) {
      conditions.push(`e.date = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }

    if (userStatus) {
      conditions.push(`ep.status = $${paramIndex}`);
      params.push(userStatus);
      paramIndex++;
    }

    if (eventStatus) {
      conditions.push(`e.status = $${paramIndex}`);
      params.push(eventStatus);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (keyword) {
      query += ` ORDER BY relevance DESC, e.date DESC`;
    } else {
      query += ` ORDER BY e.date DESC`;
    }

    try {
      console.log('Executing search query:', query);
      console.log('With params:', params);

      const result = await this.db.query(query, params);

      return result.rows.map((row) => {
        const event = new EventEntity(row);
        event.userRole = row.user_role;
        event.userStatus = row.user_status;
        event.total_count = row.total_count;
        event.status = row.status;
        if (row.relevance) event.relevance = row.relevance;
        if (row.snippet) event.snippet = row.snippet;
        return event;
      });
    } catch (error) {
      console.error('Search query failed:', error.message);
      console.error('Query:', query);
      console.error('Params:', params);
      throw error;
    }
  }

}

module.exports = EventRepository;
