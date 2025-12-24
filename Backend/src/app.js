const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const ErrorMiddleware = require("./middleware/error.middleware");

class Application {
  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  configureMiddleware() {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : ["http://localhost:4200", "http://localhost:3000"];

    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      optionsSuccessStatus: 200,
    };

    this.app.use(cors(corsOptions));
    this.app.options("*", cors(corsOptions));

    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV === "development") {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  configureRoutes() {
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        database: "Connected",
      });
    });

    this.app.get("/api", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Welcome to Event Scheduling App API",
        version: "1.0.0",
        endpoints: {
          health: {
            url: "GET /health",
            description: "Check server health status",
          },
          auth: {
            register: {
              url: "POST /api/auth/register",
              description: "Register a new user account",
              access: "Public",
            },
            login: {
              url: "POST /api/auth/login",
              description: "Login to existing account",
              access: "Public",
            },
            logout: {
              url: "POST /api/auth/logout",
              description: "Logout from current session",
              access: "Private",
            },
            profile: {
              url: "GET /api/auth/me",
              description: "Get current user profile",
              access: "Private",
            },
            verify: {
              url: "GET /api/auth/verify",
              description: "Verify JWT token validity",
              access: "Private",
            },
          },
          events: {
            create: {
              url: "POST /api/events",
              description: "Create a new event",
              access: "Private",
              body: {
                title: "string (3-255 chars)",
                description: "string (10-2000 chars)",
                date: "string (YYYY-MM-DD)",
                time: "string (HH:MM:SS)",
                location: "string (3-255 chars)",
              },
            },
            invite: {
              url: "POST /api/events/:eventId/invite",
              description: "Invite a user to an event",
              access: "Private (Organizer/Collaborator only)",
              params: {
                eventId: "integer (event ID)",
              },
              body: {
                userId: "integer (user ID to invite)",
                role: "string (Organizer, Collaborator, Attendee)",
              },
            },
            delete: {
              url: "DELETE /api/events/:eventId",
              description: "Delete (cancel) an event",
              access: "Private (Organizer only)",
              params: {
                eventId: "integer (event ID)",
              },
            },
            getOrganizerEvents: "GET /api/events/organizer",
            getInvitedEvents: "GET /api/events/invited",
            getEventParticipants: "GET /api/events/:eventId/participants",
            search: { 
                url: "GET /api/events/search",
                description: "Search events with filters",
                access: "Private",
                query: {
                  keyword: "string (optional, 2-100 chars)",
                  startDate: "string (optional, YYYY-MM-DD)",
                  endDate: "string (optional, YYYY-MM-DD)",
                  status: "string (optional, e.g., 'published')",
                  role: "string (optional, e.g., 'Organizer')",
                  userId: "integer (optional)",
                  limit: "integer (optional, 1-100, default: 20)",
                  offset: "integer (optional, default: 0)"
                    }    
              },
            updateEventStatus: {
              url: "PUT /api/events/:eventId/status",
              access: "Private",
              description: "Update the status of an event",
          }
        },
        },
        documentation: "https://github.com/your-repo/api-docs",
      });
    });

    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/events", eventRoutes);
  }

  configureErrorHandling() {
    this.app.use(ErrorMiddleware.notFound);
    this.app.use(ErrorMiddleware.handle);
  }

  getApp() {
    return this.app;
  }
}

module.exports = new Application().getApp();