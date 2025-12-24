const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class TokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || "24h";
  }

  async generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const token = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      algorithm: "HS256",
    });

    const tokenHash = this.hashToken(token);
    const expiresAt = this.calculateExpiration();

    return {
      token,
      tokenHash,
      expiresAt,
      expiresIn: this.expiresIn,
    };
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  calculateExpiration() {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt;
  }
}

module.exports = TokenService;
