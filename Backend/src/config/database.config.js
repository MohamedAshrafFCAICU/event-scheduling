const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Database time:", result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error("Database connection error:", err.message);
    return false;
  }
};

const checkTablesExist = async () => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'sessions', 'events', 'event_participants')
    `);

    const count = parseInt(result.rows[0].count);
    return count === 4;
  } catch (error) {
    console.error("Error checking tables:", error.message);
    return false;
  }
};

const runMigrations = async () => {
  try {
    console.log("Checking database schema...");

    const tablesExist = await checkTablesExist();

    if (tablesExist) {
      console.log("Database tables already exist, skipping migration");
      return true;
    }

    console.log("Creating database tables...");

    const sqlPath = path.join(__dirname, "../database/init.sql");

    if (!fs.existsSync(sqlPath)) {
      console.warn("init.sql not found at:", sqlPath);
      console.warn("Skipping migrations");
      return false;
    }

    const sql = fs.readFileSync(sqlPath, "utf8");

    await pool.query(sql);

    console.log("Database schema initialized successfully");
    console.log("Tables created:");
    console.log("- users");
    console.log("- sessions");
    console.log("- events");
    console.log("- event_participants");

    return true;
  } catch (error) {
    console.error("Migration failed:", error.message);

    if (process.env.NODE_ENV === "development") {
      console.warn("Continuing in development mode...");
      return false;
    }

    throw error;
  }
};

const initialize = async () => {
  try {
    const connected = await testConnection();

    if (!connected) {
      console.error("Failed to connect to database");
      return false;
    }

    await runMigrations();
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  checkTablesExist,
  runMigrations,
  initialize,
  query: (text, params) => pool.query(text, params),
};
