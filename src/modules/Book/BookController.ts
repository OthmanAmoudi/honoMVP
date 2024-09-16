// src/modules/Book/BookController.ts
import { Context } from "hono";
import { Delete, Get, Post, Use } from "../../utils";
import { BaseController } from "../../utils/BaseController";
import BookService from "./BookService";
import { loggingMiddleware } from "../../middlewares/AuthMiddleware";
import { logger } from "hono/logger";
import TodoService from "../Todo/TodoService";

export default class BookController extends BaseController<BookService> {
  static services = [BookService, TodoService];
  constructor(
    public bookService: BookService,
    public todoService: TodoService
  ) {
    super(bookService);
  }

  @Delete("/:id/:cid")
  @Use([loggingMiddleware("delete"), logger()])
  async delete2(c: Context) {
    return c.json({
      notes: [
        { id: 1, content: "fff 1" },
        { id: 2, content: "fff 2" },
        { id: 3, content: "fff 3" },
      ],
    });
  }
  @Get("/:cid/:page")
  async vbn(c: Context) {
    console.log(c.req.param("cid"));
    console.log(c.req.query("term"));
    console.log(c.req.param("page"));
    console.log("books controller reached");
    const books = await this.bookService.getAll();
    const todos = await this.todoService.getAll();
    console.log({ books, todos });
    // return c.json(todos);
    return c.json({
      notes: [
        { id: 1, content: "fff 1" },
        { id: 2, content: "fff 2" },
        { id: 3, content: "fff 3" },
      ],
    });
  }
  @Get("/:cid/:page")
  async sss(c: Context) {
    let xxx = c.req.param("cid");
    console.log(xxx);
    console.log(c.req.query("term"));
    console.log(c.req.param("page"));
    console.log("books controller reached");
    const todos = await this.bookService.getById(xxx);
    console.log({ todos });
    // return c.json(todos);
    return c.json({
      notes: [
        { id: 1, content: "fff 1" },
        { id: 2, content: "fff 2" },
        { id: 3, content: "fff 3" },
      ],
    });
  }
  @Get()
  async qqq(c: Context) {
    let xxx = c.req.param("cid");
    console.log(xxx);
    console.log(c.req.query("term"));
    console.log(c.req.param("page"));
    console.log("books controller reached");
    const todos = await this.bookService.getById(xxx);
    console.log({ todos });
    // return c.json(todos);
    return c.json({
      notes: [
        { id: 1, content: "fff 1" },
        { id: 2, content: "fff 2" },
        { id: 3, content: "fff 3" },
      ],
    });
  }
  @Post()
  async aaa(c: Context) {
    let xxx = c.req.param("cid");
    console.log(xxx);
    console.log(c.req.query("term"));
    console.log(c.req.param("page"));
    console.log("books controller reached");
    const todos = await this.bookService.getById(xxx);
    console.log({ todos });
    // return c.json(todos);
    return c.json({
      notes: [
        { id: 1, content: "mmm 1" },
        { id: 2, content: "mmm 2" },
        { id: 3, content: "mmm 3" },
      ],
    });
  }
}
