// src/db.js
import pkg from "pg";
import dotenv from "dotenv";
import { parse } from "pg-connection-string";

dotenv.config();

const { Pool } = pkg;

// Parse l'URL pour passer les options individuellement
const config = parse(process.env.DATABASE_URL);
config.ssl = { rejectUnauthorized: false };
config.host = config.host; // hôte Supabase
config.port = parseInt(config.port);
config.user = config.user;
config.password = config.password;
config.database = config.database;
config.family = 4; // FORCE IPv4

const pool = new Pool(config);

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connection successful:", result.rows);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testConnection();

export default pool;
