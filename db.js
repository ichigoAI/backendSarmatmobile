// src/db.js
import pkg from "pg";
import dotenv from "dotenv";
import { parse } from "pg-connection-string";

dotenv.config();

const { Pool } = pkg;

const config = parse(process.env.DATABASE_URL);
config.ssl = { rejectUnauthorized: false };
config.port = parseInt(config.port);
config.family = 4; // FORCE IPv4

export const pool = new Pool(config);

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connection successful:", result.rows);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testConnection();
