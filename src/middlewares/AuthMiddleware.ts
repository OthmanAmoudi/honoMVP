// src/middlewares/AuthMiddleware.ts
import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "30fktdskd-=2-55725-630fkfldl;spd0t9";

export const authMiddleware = () =>
  async function authMiddleware() {
    console.log("dd5dd");
    return async (c: Context, next: Next) => {
      console.log("sssssss");
      const authHeader = c.req.header("Authorization");
      if (!authHeader) {
        return c.json({ error: "No token provided" }, 401);
      }

      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        c.set("userId", decoded.userId);
        await next();
      } catch (error) {
        return c.json({ error: "Invalid token" }, 401);
      }
    };
  };
