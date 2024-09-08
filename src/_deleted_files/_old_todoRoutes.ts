// import { Hono } from "hono";
// import { TodoController } from "../controllers/TodoController";

// export default function createNoteRouter(currentController: TodoController) {
//   const router = new Hono();

//   router.get("/", currentController.getAll);
//   router.get("/:id", currentController.getById);
//   router.post("/", currentController.create);
//   router.put("/:id", currentController.update);
//   router.delete("/:id", currentController.delete);

//   return router;
// }
// import { Hono } from "hono";
// import { NoteController } from "../controllers/NoteController";

// export default function createTodoRouter(currentController: NoteController) {
//   const router = new Hono();

//   router.get("/", currentController.getAll);
//   router.get("/:id", currentController.getById);
//   router.post("/", currentController.create);
//   router.put("/:id", currentController.update);
//   router.delete("/:id", currentController.delete);

//   return router;
// }
