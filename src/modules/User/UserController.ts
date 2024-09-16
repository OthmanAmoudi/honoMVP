import { Context } from "hono";
import { Get } from "../../utils";
import { BaseController } from "../../utils/BaseController";
import UserService from "./UserService";

export default class UserController extends BaseController {
  static services = [UserService];
  constructor(public userService: UserService) {
    super(userService);
  }

  @Get("/vas")
  async vcv(c: Context) {
    return c.json({ getall: "users" });
  }
}
