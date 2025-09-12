import { Pool } from "pg";
import { DB_URL, DB_SSL } from "./config/env";

export const pool = new Pool({
  connectionString: DB_URL,
  ssl: DB_SSL ? { rejectUnauthorized: false } : false,
});