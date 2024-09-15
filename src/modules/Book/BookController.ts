import { Context } from "vm";
import { Get, Post } from "../../utils";
import { BaseController } from "../../utils/BaseController";
import BookService from "./BookService";

export default class BookController extends BaseController {
  static services = [BookService];
  constructor(public bookService: BookService) {
    super();
  }

  @Get("/:cid/:page")
  override async getAll(c: Context) {
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
}
