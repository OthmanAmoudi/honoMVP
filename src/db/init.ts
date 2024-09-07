import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// Initialize the SQLite database
const sqlite = new Database("./sqlite.db");

// Set up Drizzle with better-sqlite3
export const db = drizzle(sqlite);
