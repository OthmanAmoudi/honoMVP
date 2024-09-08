import { Context } from "hono";
import BaseController from "../../utils/BaseController";
import NoteService from "./NoteService";
import { Get } from "../../utils/routeDecorators";

// src/controllers/TodoController.ts
export default class NoteController extends BaseController {
  constructor(noteService: NoteService) {
    super(noteService);
  }

  @Get("/xxx")
  async xxx(c: Context) {
    return c.text("Hello Worldzzzz");
  }
}
