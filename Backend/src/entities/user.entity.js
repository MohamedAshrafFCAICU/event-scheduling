class UserEntity {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.password_hash || data.passwordHash;
    this.firstName = data.first_name || data.firstName;
    this.lastName = data.last_name || data.lastName;
    this.isActive = Boolean(data.is_active ?? true);
    this.createdAt = new Date(data.created_at || data.createdAt || Date.now());
    this.updatedAt = new Date(data.updated_at || data.updatedAt || Date.now());
    this.lastLogin = data.last_login ? new Date(data.last_login) : null;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  isAccountActive() {
    return this.isActive === true;
  }

  toDTO() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
    };
  }

  toDatabase() {
    return {
      username: this.username,
      email: this.email,
      password_hash: this.passwordHash,
      first_name: this.firstName,
      last_name: this.lastName,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      last_login: this.lastLogin,
    };
  }
}

module.exports = UserEntity;
