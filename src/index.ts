// src/index.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupRoutes } from "./utils/RegisterRoutes";
import routesConfig from "./routes";
import { logger } from "hono/logger";

const app = new Hono();
// Global Middlewares
app.use(logger());

// Routes
setupRoutes(app, routesConfig, { prefix: "/api" });
serve(app);
