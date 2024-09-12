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

  private async initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeDB();
    }
    await this.initializationPromise;
  }

  private async initializeDB(): Promise<void> {
    if (!this.dbInstance) {
      try {
        const connection = await mysql.createConnection({
          host: process.env.MYSQL_HOST,
          port: Number(process.env.MYSQL_PORT),
          user: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DATABASE,
        });
        console.log(
          "Database connected successfully to MySQL:",
          process.env.MYSQL_DATABASE
        );
        this.dbInstance = drizzle(connection);
      } catch (error) {
        console.error("Failed to connect to MySQL:", error);
        throw new Error("MySQL connection failed");
      }
    }
  }

  public async getDB(): Promise<MySql2Database> {
    await this.initialize();
    if (!this.dbInstance) {
      throw new Error("Database not initialized");
    }
    return this.dbInstance;
  }
}

<<<<<<< HEAD
export const db = () => DatabaseSingleton.getInstance();
=======
// Export a function to get the singleton instance
export const db = async (): Promise<MySql2Database> => {
  const instance = await DatabaseSingleton.getInstance();
  return instance.getDB();
};
>>>>>>> b57ab5ca2d1cc3cc034511c5ffa0d11bc127e89e
