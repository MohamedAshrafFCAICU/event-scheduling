const BaseError = require("../errors/base.error");

class ErrorMiddleware {
  static handle(err, req, res, next) {
    console.error("[Error]", err);

    if (err instanceof BaseError) {
      return res.status(err.statusCode).json(err.toJSON());
    }

    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Resource already exists",
        statusCode: 409,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
      statusCode: 500,
    });
  }

  static notFound(req, res) {
    res.status(404).json({
      success: false,
      message: "Route not found",
      statusCode: 404,
      path: req.originalUrl,
    });
  }
}

module.exports = ErrorMiddleware;
