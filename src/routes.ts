// src/routes.ts
import { logger } from "hono/logger";
import { RoutesConfig } from "./utils";
import NoteController from "./modules/Note/NoteController";
import TodoController from "./modules/Todo/TodoController";

const routesConfig: RoutesConfig[] = [
  {
    path: "/todos",
    controller: TodoController, // this controller by default has all the standard routes (getAll,getById,create,update,delete)
  },
  {
    path: "/notes",
    controller: NoteController,
    standardRoutes: true, // if false (getAll,getById,create,update,delete) will not be included
    middlewares: logger(), // apply middleware for all routes
  },
];
export default routesConfig;
