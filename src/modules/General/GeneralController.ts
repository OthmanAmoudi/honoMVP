import { Context } from "hono";
import { BaseController } from "../../utils/BaseController";
import { Get, Use } from "../../utils/RouteDecorators";
import { logger } from "hono/logger";
import { loggingMiddleware } from "../../middlewares/AuthMiddleware";

export default class GeneralController extends BaseController {
  constructor() {
    super(); // No need to pass a service
  }

  @Get("/general")
  @Use([logger(), loggingMiddleware])
  async getAllNotes(c: Context) {
    console.log("first");
    return c.json({
      notes: [
        { id: 1, content: "ddddd" },
        { id: 2, content: "ddddd" },
        { id: 3, content: "ddddd" },
      ],
    });
  }

  @Get("/general2")
  async getAllTodos(c: Context) {
    return c.json({
      todos: [
        { id: 1, content: "ddddd" },
        { id: 2, content: "ddddd" },
        { id: 3, content: "ddddd" },
      ],
    });
  }
}
