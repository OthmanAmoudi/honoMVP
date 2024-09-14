// GeneralController.ts
import { Context } from "hono";
import { BaseController } from "../../utils/BaseController";
import { Get, Use } from "../../utils/Decorators";
import { logger } from "hono/logger";
import { loggingMiddleware } from "../../middlewares/AuthMiddleware";
import TodoService from "../Todo/TodoService";

export default class GeneralController extends BaseController {
  static services = [TodoService];

  constructor(public todoService: TodoService) {
    super();
  }

  @Get("/")
  async fff(c: Context) {
    console.log("General controller reached");
    // const todos = await this.todoService.getAll();
    // return c.json(todos);
    return c.json({
      notes: [
        { id: 1, content: "fff 1" },
        { id: 2, content: "fff 2" },
        { id: 3, content: "fff 3" },
      ],
    });
  }
  @Get("/vvv")
  async vvv(c: Context) {
    console.log("General controller reached");
    return c.json({
      notes: [
        { id: 1, content: "vvv 1" },
        { id: 2, content: "vvv 2" },
        { id: 3, content: "vvv 3" },
      ],
    });
  }

  @Get("general")
  @Use(loggingMiddleware)
  @Use(logger())
  async xxx(c: Context) {
    console.log("General controller reached");
    return c.json({
      notes: [
        { id: 1, content: "Note 1" },
        { id: 2, content: "Note 2" },
        { id: 3, content: "Note 3" },
      ],
    });
  }

  @Get("general2")
  async bbb(c: Context) {
    return c.json({
      todos: [
        { id: 1, content: "ddddd" },
        { id: 2, content: "ddddd" },
        { id: 3, content: "ddddd" },
      ],
    });
  }
}
