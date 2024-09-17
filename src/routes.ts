// src/routes.ts
import { logger } from "hono/logger";
import { RouteConfig } from "./utils";
import NoteController from "./modules/Note/NoteController";
import TodoController from "./modules/Todo/TodoController";

const routeConfig: RouteConfig[] = [
  {
    prefix: "/api",
    path: "/todos",
    controller: TodoController, // this controller by default has all the standard routes (getAll,getById,create,update,delete)
    nestedRoutes: [
      {
        path: "/ooo",
        controller: NoteController,
        standardRoutes: true, // if false (getAll,getById,create,update,delete) will not be included
        middlewares: logger(), // apply middleware for all routes
      },
    ],
  },
  {
    path: "/notes",
    controller: NoteController,
    standardRoutes: true, // if false (getAll,getById,create,update,delete) will not be included
    middlewares: logger(), // apply middleware for all routes
  },
];
export default routeConfig;
