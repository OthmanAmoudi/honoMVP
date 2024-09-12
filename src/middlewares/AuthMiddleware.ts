import { Context, Next } from "hono";

// Example Middleware Function
export const loggingMiddleware = async (c: Context, next: Next) => {
  // Log request information
  const { method, url, header } = c.req;
  const userAgent = c.req.header("User-Agent");
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${url} from ${userAgent}`);

  // Proceed to the next middleware or route handler
  await next();
};
