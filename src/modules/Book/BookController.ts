import { Context } from "vm";
import { Delete, Get, Post, Use } from "../../utils";
import { BaseController } from "../../utils/BaseController";
import BookService from "./BookService";
import { loggingMiddleware } from "../../middlewares/AuthMiddleware";
import { logger } from "hono/logger";

export default class BookController extends BaseController {
  static services = [BookService];
  constructor(public bookService: BookService) {
    super();
  }

  @Delete("/:id/:cid")
  @Use([loggingMiddleware("delete"), logger()])
  async delete(c: Context) {
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
    const todos = await this.bookService.getAll();
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
  @Get("/:cid/:page")
  async sss(c: Context) {
    let xxx = c.req.param("cid");
    console.log(xxx);
    console.log(c.req.query("term"));
    console.log(c.req.param("page"));
    console.log("books controller reached");
    const todos = await this.bookService.khr(xxx);
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
    const todos = await this.bookService.khr(xxx);
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
    const todos = await this.bookService.khr(xxx);
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
