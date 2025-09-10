import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const useSsl = String(process.env.DATABASE_SSL || "").toLowerCase() === "true";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

