import { Context } from "hono";
import { BaseController } from "../../utils/BaseController";
import { Get, Use } from "../../utils/Decorators";
import { loggingMiddleware } from "../../middlewares/AuthMiddleware";
import NoteService from "./NoteService";
import TodoService from "../Todo/TodoService";

export default class NoteController extends BaseController {
  static services = [NoteService, TodoService];

  constructor(
    public noteService: NoteService,
    public todoService: TodoService
  ) {
    super(noteService);
  }

  @Get("/xxx")
  @Use(loggingMiddleware)
  async getAllNotes(c: Context) {
    const notes = await this.noteService.getAll();
    // const notes = await this.todoService.getAll(); //Error: Property 'todoService' does not exist on type 'NoteController'.ts(2339)
    return c.json(notes);
  }

  @Get("/bbb")
  async getAllTodos(c: Context) {
    const todos = await this.noteService.getAll();
    return c.json(todos);
  }
}
