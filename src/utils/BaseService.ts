// src/services/BaseService.ts
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { ValidationError } from "../utils/errors";
import { Static, TSchema } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import { Logger } from "../utils/Logger";

export abstract class BaseService<
  TModel extends object = object,
  TCreateSchema extends TSchema = TSchema,
  TUpdateSchema extends TSchema = TSchema
> {
  constructor(public readonly db: PostgresJsDatabase) {}

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

  /**
   * Retrieves a list of models.
   * @param cursor Optional cursor for pagination.
   * @param limit Optional limit of items to retrieve.
   */
  abstract getAll(cursor?: number | string, limit?: number): Promise<TModel[]>;

  /**
   * Retrieves a model by its ID.
   * @param id The ID of the model to retrieve.
   */
  abstract getById(id: number | string): Promise<TModel>;

  /**
   * Creates a new model instance.
   * @param data The data to create the model with.
   */
  abstract create(data: Static<TCreateSchema>): Promise<TModel>;

  /**
   * Updates an existing model.
   * @param id The ID of the model to update.
   * @param data The data to update the model with.
   */
  abstract update(
    id: number | string,
    data: Static<TUpdateSchema>
  ): Promise<TModel>;

  /**
   * Deletes a model by its ID.
   * @param id The ID of the model to delete.
   */
  abstract delete(id: number | string): Promise<void>;
}
