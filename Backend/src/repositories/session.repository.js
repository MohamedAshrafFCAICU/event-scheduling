const BaseRepository = require("./base.repository");

class SessionRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = "sessions";
  }

  async create(userId, tokenHash, expiresAt) {
    const query = `
      INSERT INTO ${this.tableName} (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, created_at
    `;

    const result = await this.db.query(query, [userId, tokenHash, expiresAt]);
    return result.rows[0];
  }

  async findByTokenHash(tokenHash) {
    const query = `SELECT * FROM ${this.tableName} WHERE token_hash = $1 LIMIT 1`;
    const result = await this.db.query(query, [tokenHash]);
    return result.rows.length ? new SessionEntity(result.rows[0]) : null;
  }

  async invalidate(tokenHash) {
    const query = `
      UPDATE ${this.tableName}
      SET is_valid = false
      WHERE token_hash = $1
      RETURNING id
    `;

    const result = await this.db.query(query, [tokenHash]);
    return result.rows.length > 0;
  }

  async isValid(tokenHash) {
    const query = `
      SELECT id, user_id, is_valid, expires_at
      FROM ${this.tableName}
      WHERE token_hash = $1
        AND is_valid = true
        AND expires_at > NOW()
    `;

    const result = await this.db.query(query, [tokenHash]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async cleanupExpired() {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE expires_at < NOW() OR is_valid = false
    `;

    const result = await this.db.query(query);
    return result.rowCount;
  }
}

module.exports = SessionRepository;
