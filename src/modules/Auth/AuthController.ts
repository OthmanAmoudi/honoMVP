// src/modules/Auth/AuthController.ts
import { Context } from "hono";
import { Post, Use } from "../../utils";
import { BaseController } from "../../utils/BaseController";
import AuthService from "./AuthService";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { validateBody } from "../../middlewares/ValidationMiddleware";
import { LoginSchema, RefreshTokenSchema, RegisterSchema } from "./AuthModel";
import { loggingMiddleware } from "../../middlewares/LoggingMiddleware";

export default class AuthController extends BaseController {
  static services = [AuthService];
  constructor(public authService: AuthService) {
    super(authService);
  }

  @Post("/login")
  @Use(validateBody(LoginSchema))
  async login(c: Context) {
    const { email, password } = await c.req.json();
    const result = await this.authService.login(email, password);
    return c.json(result);
  }

  @Post("/register")
  @Use([validateBody(RegisterSchema), loggingMiddleware()])
  async register(c: Context) {
    const userData = await c.req.json();
    const result = await this.authService.register(userData);
    return c.json(result);
  }

  @Post("/refresh-token")
  @Use(validateBody(RefreshTokenSchema))
  async refreshToken(c: Context) {
    const { refreshToken } = await c.req.json();
    const result = await this.authService.refreshToken(refreshToken);
    return c.json(result);
  }

  @Post("/logout")
  @Use(authMiddleware())
  async logout(c: Context) {
    const userId = c.get("userId");
    await this.authService.logout(userId);
    return c.json({ message: "Logged out successfully" });
  }

  @Post("/secret")
  @Use(authMiddleware())
  async secret(c: Context) {
    return c.json({ say_dada: "DA DA DA DA!" });
  }
}
