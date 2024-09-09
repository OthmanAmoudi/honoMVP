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
    const C = TypeCompiler.Compile(schema);
    if (C.Check(obj)) {
      const cleanedObj: Partial<Static<T>> = {};
      for (const key in schema.properties) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cleanedObj[key as keyof Static<T>] = obj[key as keyof typeof obj];
        }
      }
      return cleanedObj as Static<T>;
    } else {
      throw new ValidationError("Validation failed", C.Errors(obj));
    }
  }

  abstract getAll(): Promise<any[]>;
  abstract getById(id: string): Promise<any>;
  abstract create(data: any): Promise<any>;
  abstract update(id: string, data: any): Promise<any>;
  abstract delete(id: string): Promise<void>;
}
