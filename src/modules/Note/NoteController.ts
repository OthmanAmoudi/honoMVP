import { Context } from "hono";
import BaseController from "../../utils/BaseController";
import NoteService from "./NoteService";
import { Get, Use } from "../../utils/RouteDecorators";
import { logger } from "hono/logger";
import { TodoService } from "../Todo/TodoService";

export default class NoteController extends BaseController<NoteService> {
  private todoService: TodoService;
  constructor(noteService: NoteService) {
    super(noteService);
    this.todoService = new TodoService();
  }

  @Get("/xxx")
  @Use(logger())
  async getAllNotes(c: Context) {
    const notes = await this.service.getAll();
    return c.json(notes);
  }

  @Get("/bbb")
  async getAllTodos(c: Context) {
    const todos = await this.todoService.getAll();
    return c.json(todos);
  }
}
