// src/middlewares/validationMiddleware.ts
import { Context } from "hono";
import { validate } from "../utils/ValidateObject";
export function validateBody(schema: any) {
  return async function validateBody(c: Context, next: () => Promise<void>) {
    const body = await c.req.json();
    let result;
    try {
      result = validate(schema, body);
      if (result.success) {
        c.req.valid = () => body;
        await next();
      } else {
        return c.json({ error: result }, 400);
      }
    } catch (error) {
      return c.json({ error: result.issues }, 400);
    }
  };
}
