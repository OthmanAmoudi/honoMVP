//src/modules/General/GeneralController.ts
import { Context } from "hono";
import { BaseController } from "../../utils/BaseController";
import { Get, Use } from "../../utils/RouteDecorators";
import { logger } from "hono/logger";
import { loggingMiddleware } from "../../middlewares/AuthMiddleware";
import NoteService from "./GeneralService";

export default class GeneralController extends BaseController<NoteService> {
  constructor(noteService: NoteService) {
    super(noteService);
  }

  @Get("/general")
  @Use([logger(), loggingMiddleware])
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

  @Get("/general2")
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
