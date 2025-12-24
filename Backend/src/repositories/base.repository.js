class BaseRepository {
  constructor(db) {
    this.db = db;
  }

  async findById(id) {
    throw new Error("Method not implemented");
  }

  async findAll(options = {}) {
    throw new Error("Method not implemented");
  }

  async create(entity) {
    throw new Error("Method not implemented");
  }

  async update(id, entity) {
    throw new Error("Method not implemented");
  }

  async delete(id) {
    throw new Error("Method not implemented");
  }

  async count(conditions = {}) {
    throw new Error("Method not implemented");
  }

  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }
}

module.exports = BaseRepository;
