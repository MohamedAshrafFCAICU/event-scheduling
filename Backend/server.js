const app = require("./src/app");
const db = require("./src/config/database.config");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

const startServer = async () => {
  try {
    console.log("Starting server initialization...\n");
    console.log("1️Initializing database...");
    const dbReady = await db.initialize();

    if (!dbReady) {
      const isDev = (process.env.NODE_ENV || "development") === "development";
      if (isDev) {
        console.warn("Database not ready. Continuing in development mode.");
      } else {
        console.error("Failed to initialize database");
        process.exit(1);
      }
    }

    console.log("\nStarting HTTP server...");
    app.listen(PORT, HOST, () => {
      console.log("\n" + "=".repeat(60));
      console.log("SERVER STARTED SUCCESSFULLY!");
      console.log("=".repeat(60));
      console.log(`\nServer URL: http://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Database: ${process.env.DB_NAME}`);
      console.log(`Started at: ${new Date().toLocaleString()}`);

      console.log("\n" + "=".repeat(60));
      console.log("AVAILABLE ENDPOINTS");
      console.log("=".repeat(60));

      console.log("\nHealth & Info:");
      console.log(`   GET    http://${HOST}:${PORT}/health`);
      console.log(`   GET    http://${HOST}:${PORT}/api`);

      console.log("\nAuthentication:");
      console.log(`   POST   http://${HOST}:${PORT}/api/auth/register`);
      console.log(`   POST   http://${HOST}:${PORT}/api/auth/login`);
      console.log(`   POST   http://${HOST}:${PORT}/api/auth/logout`);
      console.log(`   GET    http://${HOST}:${PORT}/api/auth/me`);
      console.log(`   GET    http://${HOST}:${PORT}/api/auth/verify`);

      console.log("\nEvents:");
      console.log(`   POST   http://${HOST}:${PORT}/api/events`);
      console.log(
        `   POST   http://${HOST}:${PORT}/api/events/:eventId/invite`
      );
      console.log(`   DELETE http://${HOST}:${PORT}/api/events/:eventId`);

      console.log("\n" + "=".repeat(60));
      console.log("Ready to accept requests!");
      console.log("=".repeat(60) + "\n");
    });
  } catch (error) {
    console.error("\nFailed to start server:", error);
    console.error(error.stack);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  console.log("\nSIGTERM signal received: closing HTTP server");
  app.close(() => {
    console.log("HTTP server closed");
    db.pool.end(() => {
      console.log("Database pool closed");
      console.log("Goodbye!");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("\n\nSIGINT signal received: closing HTTP server");
  db.pool.end(() => {
    console.log("Database pool closed");
    console.log("Goodbye!");
    process.exit(0);
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
