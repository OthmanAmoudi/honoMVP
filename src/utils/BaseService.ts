// src/services/BaseService.ts
import { db } from "../db/singletonDBInstance";
import { ValidationError, NotFoundError, DatabaseError } from "./Errors";
import { Type, Static, TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";

type ServiceMethod<T> = (...args: any[]) => Promise<T>;

export default abstract class BaseService {
  protected db = db;

  protected async handleErrors<U>(method: ServiceMethod<U>): Promise<U> {
    try {
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
          `❌ Validation Error` +
            ` At: ${
              Array.isArray(path) ? path.join(".") : path || "(root)"
            }\n` +
            ` ⚠️  Issue: ${message}` +
            ` got: (${value})`
        );
      }

      // Optional: Logging the errors for debugging purposes
      console.log("Validation Errors:\n", errors.join("\n\n"));

      throw new ValidationError("Validation failed", errors);
    }
  }

  abstract getAll(): Promise<any[]>;
  abstract getById(id: string): Promise<any>;
  abstract create(data: any): Promise<any>;
  abstract update(id: string, data: any): Promise<any>;
  abstract delete(id: string): Promise<void>;
}
