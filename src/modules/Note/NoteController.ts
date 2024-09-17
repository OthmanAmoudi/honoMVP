import { Context } from "hono";
import { BaseController } from "../../utils/BaseController";
import { Get, Use } from "../../utils/Decorators";
import { loggingMiddleware } from "../../middlewares/LoggingMiddleware";
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

  @Get("/")
  @Use(loggingMiddleware("***"))
  async getAll(c: Context) {
    const notes = {
      id: "1",
      content: "test",
    }; //await this.noteService.getAll();
    // const notes = await this.todoService.getAll();
    return c.json(notes);
  }

  @Get("/bbb")
  async getAllTodos(c: Context) {
    const todos = await this.noteService.getAll();
    return c.json(todos);
  }
}
