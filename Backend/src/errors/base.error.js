class BaseError extends Error {
  constructor(message, statusCode = 500, errorType = "InternalServerError") {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      errorType: this.errorType,
    };
  }
}

module.exports = BaseError;
