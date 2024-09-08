import { Context } from "hono";
import BaseController from "../../utils/BaseController";
import NoteService from "./NoteService";
import { Get, Use } from "../../utils/routeDecorators";
import { logger } from "hono/logger";

// src/controllers/TodoController.ts
export default class NoteController extends BaseController {
  constructor(noteService: NoteService) {
    super(noteService);
  }

  @Get("/xxx")
  @Use(logger())
  async sssdfsd(c: Context) {
    return c.text("Hello Worldzzzz");
  }

  @Get("/")
  async xcvxcvx(c: Context) {
    return c.text("Hello muxxxx");
  }
}
