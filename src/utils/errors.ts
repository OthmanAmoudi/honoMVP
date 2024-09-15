// src/utils/errors.ts
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export class ValidationError extends Error {
  public errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export function withErrorHandler(err: unknown, c: Context) {
  console.error("Error:", err);

  if (err instanceof ValidationError) {
    return c.json({ error: "Validation error", message: err.message }, 400);
  }

  if (err instanceof NotFoundError) {
    // Handle not found errors
    return c.json({ error: "Resource not found", message: err.message }, 404);
  }

  if (err instanceof HTTPException) {
    // Handle Hono's built-in HTTP exceptions
    return c.json(
      { error: "HTTP Exception", message: err.message },
      err.status
    );
  }

  if (err instanceof Error) {
    // Handle other known errors
    return c.json(
      { message: "Internal Server Error", error: err.message },
      500
    );
  }

  // Handle unknown errors
  return c.json({ message: "An unexpected error occurred" }, 500);
}

export async function errorHandler<U>(
  method: () => Promise<U>,
  c: Context
): Promise<Response | Awaited<U>> {
  try {
    return await method();
  } catch (error) {
    return withErrorHandler(error, c);
  }
}
