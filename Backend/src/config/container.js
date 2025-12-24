const db = require("./database.config");

// Repositories
const UserRepository = require("../repositories/user.repository");
const SessionRepository = require("../repositories/session.repository");
const EventRepository = require("../repositories/event.repository");
const EventParticipantRepository = require("../repositories/eventParticipant.repository");

// Services
const AuthService = require("../services/auth.service");
const UserService = require("../services/user.service");
const EventService = require("../services/event.service");

// Controllers
const AuthController = require("../controllers/auth.controller");
const UserController = require("../controllers/user.controller");
const EventController = require("../controllers/event.controller");

class Container {
  constructor() {
    this.services = new Map();
    this._registerServices();
  }

  _registerServices() {
    // ============================================
    // Register Repositories
    // ============================================
    this.register("UserRepository", () => new UserRepository(db));
    this.register("SessionRepository", () => new SessionRepository(db));
    this.register("EventRepository", () => new EventRepository(db));
    this.register(
      "EventParticipantRepository",
      () => new EventParticipantRepository(db)
    );

    // ============================================
    // Register Services
    // ============================================
    this.register("AuthService", () => {
      const userRepo = this.resolve("UserRepository");
      const sessionRepo = this.resolve("SessionRepository");
      return new AuthService(userRepo, sessionRepo);
    });

    this.register("UserService", () => {
      const userRepo = this.resolve("UserRepository");
      return new UserService(userRepo);
    });

    this.register("EventService", () => {
      const eventRepo = this.resolve("EventRepository");
      const eventParticipantRepo = this.resolve("EventParticipantRepository");
      const userRepo = this.resolve("UserRepository"); // ✅ ADD THIS
      return new EventService(eventRepo, eventParticipantRepo, userRepo);
    });

    // ============================================
    // Register Controllers
    // ============================================
    this.register("AuthController", () => {
      const authService = this.resolve("AuthService");
      return new AuthController(authService);
    });

    this.register("UserController", () => {
      const userService = this.resolve("UserService");
      return new UserController(userService);
    });

    this.register("EventController", () => {
      const eventService = this.resolve("EventService");
      return new EventController(eventService);
    });
  }

  register(name, factory) {
    this.services.set(name, { factory, singleton: null });
  }

  resolve(name) {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (!service.singleton) {
      service.singleton = service.factory();
    }

    return service.singleton;
  }
}

module.exports = new Container();