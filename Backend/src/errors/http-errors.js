const BaseError = require("./base.error");

class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super(message, 400, "BadRequest");
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401, "Unauthorized");
  }
}

class ForbiddenError extends BaseError {
  constructor(message = "Forbidden") {
    super(message, 403, "Forbidden");
  }
}

class NotFoundError extends BaseError {
  constructor(message = "Not Found") {
    super(message, 404, "NotFound");
  }
}

class ConflictError extends BaseError {
  constructor(message = "Conflict") {
    super(message, 409, "Conflict");
  }
}

class InternalServerError extends BaseError {
  constructor(message = "Internal Server Error") {
    super(message, 500, "InternalServerError");
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
