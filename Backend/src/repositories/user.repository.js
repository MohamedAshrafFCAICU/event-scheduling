const BaseRepository = require("./base.repository");
const UserEntity = require("../entities/user.entity");

class UserRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = "users";
  }

  async findById(id) {
    const query = `
      SELECT id, username, email, password_hash, first_name, last_name,
             is_active, created_at, updated_at, last_login
      FROM ${this.tableName}
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new UserEntity(result.rows[0]);
  }

  async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, first_name, last_name,
             is_active, created_at, updated_at, last_login
      FROM ${this.tableName}
      WHERE email = $1
    `;

    const result = await this.db.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return new UserEntity(result.rows[0]);
  }

  async findByUsername(username) {
    const query = `
      SELECT id, username, email, password_hash, first_name, last_name,
             is_active, created_at, updated_at, last_login
      FROM ${this.tableName}
      WHERE username = $1
    `;

    const result = await this.db.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    return new UserEntity(result.rows[0]);
  }

  async create(userEntity) {
    const query = `
      INSERT INTO ${this.tableName}
        (username, email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, first_name, last_name,
                is_active, created_at
    `;

    const values = [
      userEntity.username,
      userEntity.email,
      userEntity.passwordHash,
      userEntity.firstName,
      userEntity.lastName,
    ];

    const result = await this.db.query(query, values);
    return new UserEntity(result.rows[0]);
  }

  async update(id, userEntity) {
    const query = `
      UPDATE ${this.tableName}
      SET username = $1,
          email = $2,
          first_name = $3,
          last_name = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, username, email, first_name, last_name,
                is_active, created_at, updated_at
    `;

    const values = [
      userEntity.username,
      userEntity.email,
      userEntity.firstName,
      userEntity.lastName,
      id,
    ];

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return new UserEntity(result.rows[0]);
  }

  async updateLastLogin(userId) {
    const query = `
      UPDATE ${this.tableName}
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING last_login
    `;

    const result = await this.db.query(query, [userId]);
    return result.rows[0];
  }

  async existsByEmail(email) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM ${this.tableName} WHERE email = $1
      ) as exists
    `;

    const result = await this.db.query(query, [email]);
    return result.rows[0].exists;
  }

  async existsByUsername(username) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM ${this.tableName} WHERE username = $1
      ) as exists
    `;

    const result = await this.db.query(query, [username]);
    return result.rows[0].exists;
  }

  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      orderBy = "created_at",
      order = "DESC",
    } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT id, username, email, first_name, last_name,
             is_active, created_at, updated_at, last_login
      FROM ${this.tableName}
      ORDER BY ${orderBy} ${order}
      LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query(query, [limit, offset]);
    return result.rows.map((row) => new UserEntity(row));
  }

  async count(conditions = {}) {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const result = await this.db.query(query);
    return parseInt(result.rows[0].count);
  }

  async delete(id) {
    const query = `
      UPDATE ${this.tableName}
      SET is_active = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await this.db.query(query, [id]);
    return result.rows.length > 0;
  }

  async hardDelete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);
    return result.rows.length > 0;
  }
}

module.exports = UserRepository;
