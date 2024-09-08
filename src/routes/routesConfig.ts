// src/routes/routeConfig.ts
import { logger } from "hono/logger";
import { RouteConfig } from "../types/types";
import NoteController from "../modules/Note/NoteController";
import TodoController from "../modules/Todo/TodoController";

// Define an array with routes and associated controllers
export const routeConfig: RouteConfig[] = [
  {
    path: "/todos",
    controller: TodoController, // this controller by default has all the standard routes (getAll,getById,create,update,delete)
  },
  {
    path: "/notes",
    controller: NoteController,
    // standardRoutes: false, // if false (getAll,getById,create,update,delete) will not be included
    // middlewares: logger(), // apply middleware for all routes
  },
];
