import { Hono } from "hono";
import { TodoController } from "../controllers/TodoController";

export default function createTodoRouter(todoController: TodoController) {
  const router = new Hono();

  router.get("/", todoController.getAll);
  router.get("/:id", todoController.getById);
  router.post("/", todoController.create);
  router.put("/:id", todoController.update);
  router.delete("/:id", todoController.delete);

  return router;
}
