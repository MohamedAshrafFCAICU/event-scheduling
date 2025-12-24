class SessionEntity {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.tokenHash = data.token_hash || data.tokenHash;
    this.isValid = data.is_valid ?? true;
    this.expiresAt = new Date(data.expires_at || data.expiresAt);
    this.createdAt = new Date(data.created_at || data.createdAt);
  }

  isExpired() {
    return this.expiresAt <= new Date();
  }

  isActive() {
    return this.isValid && !this.isExpired();
  }

  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      tokenHash: this.tokenHash,
      isValid: this.isValid,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      active: this.isActive(),
    };
  }

  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      token_hash: this.tokenHash,
      is_valid: this.isValid,
      expires_at: this.expiresAt,
      created_at: this.createdAt,
    };
  }
}

module.exports = SessionEntity;
