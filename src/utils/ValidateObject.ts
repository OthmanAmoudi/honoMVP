import { ValidationError } from "./errors";
import { BaseSchema, ValiError, parse, safeParse } from "valibot";

export function validate<T>(
  schema: BaseSchema<unknown, T, any>,
  data: unknown
): any {
  try {
    return safeParse(schema, data);
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
