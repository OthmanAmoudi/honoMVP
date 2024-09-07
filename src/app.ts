import { Hono } from "hono";
import { TodoController } from "./controllers/TodoController";
import { db } from "./db/init";
import { TodoService } from "./services/TodoService";
import createTodoRouter from "./routes/todoRoutes";
import { logger } from "hono/logger";

const app = new Hono();
app.use(logger());

app.route("/todos", createTodoRouter(new TodoController(new TodoService(db))));
export default app;
