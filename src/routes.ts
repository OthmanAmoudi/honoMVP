// src/routes.ts
import { RouteConfig } from "./utils";
import NoteController from "./modules/Note/NoteController";
import TodoController from "./modules/Todo/TodoController";
import GeneralController from "./modules/General/GeneralController";

// routes.ts
const routeConfig: RouteConfig[] = [
  {
    path: "todos",
    controller: TodoController,
  },
  {
    path: "notes",
    controller: NoteController,
    standardRoutes: true,
    nestedRoutes: [
      {
        path: "ooo",
        controller: GeneralController,
        standardRoutes: false,
      },
    ],
  },
];
export default routeConfig;
