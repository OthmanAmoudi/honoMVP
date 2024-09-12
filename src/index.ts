import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import setupRoutes from "./utils/RegisterRoutes";
import routesConfig from "./routes";
import { printBootInfo } from "./utils/bootlogger";

const app = new Hono();
// Middleware
// app.use(logger());

// Routes
const bootInfo = setupRoutes(app, routesConfig);

// Print boot information
printBootInfo(bootInfo);
serve(app);
