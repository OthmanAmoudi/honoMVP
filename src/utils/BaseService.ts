// src/services/BaseService.ts
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { ValidationError } from "../utils/errors";
import { BaseSchema, ValiError, parse } from "valibot";

export abstract class BaseService {
  constructor(public readonly db: BetterSQLite3Database) {}

  protected validate<T>(schema: BaseSchema<unknown, T, any>, data: unknown): T {
    try {
      return parse(schema, data);
    } catch (error) {
      if (error instanceof ValiError) {
        const validationErrors = error.issues.map((issue) => ({
          path: issue.path?.map((p: { key: string }) => p.key).join("."),
          message: issue.message,
        }));
        throw new ValidationError("Validation failed", validationErrors);
      }
      throw error;
    }
  }

  /**
   * Retrieves a list of models.
   * @param cursor Optional cursor for pagination.
   * @param limit Optional limit of items to retrieve.
   */
  getAll?(cursor?: number | string, limit?: number): Promise<any[]>;

  /**
   * Retrieves a model by its ID.
   * @param id The ID of the model to retrieve.
   */
  getById?(id: number | string): Promise<any>;

  /**
   * Creates a new model instance.
   * @param data The data to create the model with.
   */
  create?(data: any): Promise<any>;

  /**
   * Updates an existing model.
   * @param id The ID of the model to update.
   * @param data The data to update the model with.
   */
  update?(id: number | string, data: any): Promise<any>;

  /**
   * Deletes a model by its ID.
   * @param id The ID of the model to delete.
   */
  delete?(id: number | string): Promise<void>;
}
