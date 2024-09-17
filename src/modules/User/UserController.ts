// src/modules/User/UserController.ts
import { Context } from "hono";
import { Get, Use } from "../../utils";
import { BaseController } from "../../utils/BaseController";
import UserService from "./UserService";
import { loggingMiddleware } from "../../middlewares/LoggingMiddleware";

export default class UserController extends BaseController {
  static services = [UserService];
  constructor(public userService: UserService) {
    super(userService);
  }

  @Get("/")
  @Use(loggingMiddleware())
  async getCurrentUser(c: Context) {
    return c.json({ get: "user" });
  }
}
