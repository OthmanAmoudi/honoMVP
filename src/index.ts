import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import setupRoutes from "./utils/RegisterRoutes";
import routesConfig from "./routes";

const app = new Hono();
// Middleware
app.use(logger());

// Routes
setupRoutes(app, routesConfig);
serve(app);
