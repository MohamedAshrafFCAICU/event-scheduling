const jwt = require("jsonwebtoken");
const container = require("../config/container");

class AuthMiddleware {
  constructor() {
    this.authService = container.resolve("AuthService");
  }

  authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token is required",
        });
      }

      const user = await this.authService.verifyToken(token);

      req.user = user;
      req.token = token;
      req.tokenHash = this.authService.tokenService.hashToken(token);

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Authentication failed",
      });
    }
  };
}

module.exports = new AuthMiddleware();
