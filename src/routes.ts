// src/routes.ts
import { RouteConfig } from "./utils";
import NoteController from "./modules/Note/NoteController";
import TodoController from "./modules/Todo/TodoController";
import GeneralController from "./modules/General/GeneralController";

import BookController from "./modules/Book/BookController";
import UserController from "./modules/User/UserController";

const routeConfig: RouteConfig[] = [
  // {
  //   path: "todos",
  //   controller: TodoController,
  // },
  {
    path: "notes",
    controller: NoteController,
    standardRoutes: true,
    nestedRoutes: [
      {
        path: "ooo",
        controller: GeneralController,
        // standardRoutes: false,
      },
    ],
  },
  {
    path: "users",
    controller: UserController,
    standardRoutes: false,
  },
  // {
  //   path: "books",
  //   controller: BookController,
  //   // standardRoutes: false,
  // },
];
export default routeConfig;
