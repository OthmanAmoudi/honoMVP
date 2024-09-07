// src/services/BaseService.ts
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { ValidationError, NotFoundError, DatabaseError } from "../utils/errors";
import { z } from "zod";

type ServiceMethod<T> = (...args: any[]) => Promise<T>;

export abstract class BaseService {
  constructor(protected db: BetterSQLite3Database) {}

  protected async handleErrors<U>(method: ServiceMethod<U>): Promise<U> {
    try {
      return await method();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("Validation failed", error.errors);
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Unexpected error:", error);
      throw new DatabaseError("An unexpected database error occurred");
    }
  }

  abstract getAll(): Promise<any[]>;
  abstract getById(id: number): Promise<any>;
  abstract create(data: any): Promise<any>;
  abstract update(id: number, data: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}
