// src/routes.ts
import { RouteConfig } from "./utils";
import NoteController from "./modules/Note/NoteController";
import TodoController from "./modules/Todo/TodoController";
import GeneralController from "./modules/General/GeneralController";
import UserController from "./modules/User/UserController";
import AuthController from "./modules/Auth/AuthController";

const routeConfig: RouteConfig[] = [
  {
    path: "todos",
    controller: TodoController,
    // standardRoutes:true // by default is true
  },
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
    // standardRoutes: false,
  },
  {
    path: "auth",
    controller: AuthController,
    standardRoutes: false,
  },
];
export default routeConfig;
