// src/routes/routeConfig.ts
import { logger } from "hono/logger";
import { RouteConfig } from "../types/types";
import NoteController from "../modules/Note/NoteController";
import TodoController from "../modules/Todo/TodoController";
import NoteService from "../modules/Note/NoteService";

// Define an array with routes and associated controllers
export const routeConfig: RouteConfig[] = [
  {
    path: "/todos",
    controller: TodoController,
  },
  {
    path: "/notes",
    controller: NoteController,
    // middlewares: logger(),
  },
];
