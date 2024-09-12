// src/services/BaseService.ts
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { db } from "../db/singletonDBInstance";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ServiceMethod,
} from "./";
import { Static, TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

export abstract class BaseService {
  protected db!: PostgresJsDatabase; // Use ! to tell TypeScript that it's initialized later
  constructor() {
    // Using async IIFE to initialize the db
    (async () => {
      this.db = await db(); // Await the resolved database instance
    })();
  }
  protected async handleErrors<U>(method: ServiceMethod<U>): Promise<U> {
    try {
      // Make sure db is initialized before accessing it
      if (!this.db) {
        throw new Error("Database is not initialized");
      }
      return await method();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError("Validation failed", error);
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Unexpected error:", error);
      throw new DatabaseError("An unexpected database error occurred");
    }
  }
  protected validate<T extends TSchema>(schema: T, obj: unknown): Static<T> {
    // Create a new object with only the properties defined in the schema
    const cleanedObj: Partial<Static<T>> = {};
    for (const key in schema.properties) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // @ts-ignore
        cleanedObj[key as keyof Static<T>] = obj[key as keyof typeof obj];
      }
    }

    const C = TypeCompiler.Compile(schema);
    if (C.Check(cleanedObj)) {
      return cleanedObj as Static<T>;
    } else {
      const errors: string[] = [];
      // Collect and format errors into a more readable structure
      for (const error of C.Errors(cleanedObj)) {
        const { path, message, value } = error;
        errors.push(
          `Validation Error` +
            ` At: ${
              Array.isArray(path) ? path.join(".") : path || "(root)"
            }\n` +
            ` Issue: ${message}` +
            ` got: (${value})`
        );
      }

      // Optional: Logging the errors for debugging purposes
      console.log("Validation Errors:\n", errors.join("\n\n"));

      throw new ValidationError("Validation failed", errors);
    }
  }

  abstract getAll(cursor?: number | string, limit?: number): Promise<any[]>;
  abstract getById(id: number | string): Promise<any>;
  abstract create(data: any): Promise<any>;
  abstract update(id: number | string, data: any): Promise<any>;
  abstract delete(id: number | string): Promise<void>;
}
