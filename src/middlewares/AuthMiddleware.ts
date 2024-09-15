import { Context, Next } from "hono";

// Example Middleware Function
export const loggingMiddleware =
  (message?: string) => async (c: Context, next: Next) => {
    // Log request information
    const { method, url, header } = c.req;
    const userAgent = c.req.header("User-Agent");
    const timestamp = new Date().toISOString();
    console.log(message);
    console.log(`[${timestamp}] ${method} ${url} from ${userAgent} ${message}`);

    // Proceed to the next middleware or route handler
    await next();
  };
