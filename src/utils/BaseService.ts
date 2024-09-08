// src/services/BaseService.ts
import { z } from "zod";
import { db } from "../db/singletonDBInstance";
import { ValidationError, NotFoundError, DatabaseError } from "./errors";

type ServiceMethod<T> = (...args: any[]) => Promise<T>;

export default abstract class BaseService {
  protected db = db;

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
  abstract getById(id: number | string): Promise<any>;
  abstract create(data: any): Promise<any>;
  abstract update(id: number | string, data: any): Promise<any>;
  abstract delete(id: number | string): Promise<void>;
}
