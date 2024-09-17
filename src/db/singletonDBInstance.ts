// src/db/dbSingleton.ts
import betterSqlite3 from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

class DatabaseSingleton {
  private static instance: BetterSQLite3Database;

  private constructor() {}

  public static getInstance() {
    if (!DatabaseSingleton.instance) {
      const sqliteInstance = new betterSqlite3("./sqlite.db"); // Replace with your DB connection logic
      DatabaseSingleton.instance = drizzle(sqliteInstance);
    }
    return DatabaseSingleton.instance;
  }
}

export const db = DatabaseSingleton.getInstance();
