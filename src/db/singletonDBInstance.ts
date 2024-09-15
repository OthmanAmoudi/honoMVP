// src/db/singletonDBInstance.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

let dbInstancePromise: Promise<PostgresJsDatabase> | null = null;

export async function db(): Promise<PostgresJsDatabase> {
  if (dbInstancePromise) {
    return dbInstancePromise;
  }

  dbInstancePromise = (async () => {
    try {
      const pgClient = postgres({
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        database: process.env.PG_DATABASE,
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
      });

      // Attempt a simple query to check connection status
      await pgClient`SELECT 1`;
      const db = drizzle(pgClient);
      console.log(
        `PG Database '${process.env.PG_DATABASE}' connected successfully`
      );
      return db;
    } catch (error) {
      console.error("Failed to connect to PostgreSQL:", error);
      throw new Error("PostgreSQL connection failed");
    }
  })();

  return dbInstancePromise;
}
