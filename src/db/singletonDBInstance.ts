import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

class DatabaseSingleton {
  private static instance: DatabaseSingleton | null = null;
  private dbInstance: MySql2Database | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static async getInstance(): Promise<DatabaseSingleton> {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
      await DatabaseSingleton.instance.initialize();
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

// Export a function to get the singleton instance
export const db = async (): Promise<MySql2Database> => {
  const instance = await DatabaseSingleton.getInstance();
  return instance.getDB();
};
