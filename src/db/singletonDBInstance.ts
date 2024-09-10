import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

class DatabaseSingleton {
  private static instance: Promise<PostgresJsDatabase> | null = null;

  private constructor() {}

  public static async getInstance(): Promise<PostgresJsDatabase> {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = (async () => {
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
            "Database connected successfully",
            process.env.PG_DATABASE
          );
          return db;
        } catch (error) {
          console.error("Failed to connect to PostgreSQL:", error);
          throw new Error("PostgreSQL connection failed");
        }
      })();
    }
    return DatabaseSingleton.instance;
  }
}

export const db = () => DatabaseSingleton.getInstance();
