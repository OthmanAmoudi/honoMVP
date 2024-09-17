// src/modules/Auth/AuthService.ts
import { NotFoundError, BaseService, UnauthorizedError } from "../../utils";
import { eq } from "drizzle-orm";
import { userTable, NewUser } from "../User/UserModel";
import { authTable, NewAuth, AuthSchema, Auth } from "./AuthModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class AuthService extends BaseService {
  private readonly JWT_SECRET =
    process.env.JWT_SECRET || "cma3_9cna05s3-42#xhjs#fmgb%fmas*";
  private readonly JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ||
    "xk3%fjz8$,c8e/T%dmkzbh(.lgkd!,f,b&,vmd/3";

  async login(email: string, password: string) {
    const user = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
    if (!user[0]) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const auth = await this.db
      .select()
      .from(authTable)
      .where(eq(authTable.userId, user[0].id))
      .limit(1);
    if (!auth[0]) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, auth[0].password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user[0].id);
    const refreshToken = this.generateRefreshToken(user[0].id);

    await this.db
      .update(authTable)
      .set({ refreshToken })
      .where(eq(authTable.userId, user[0].id));

    return { accessToken, refreshToken };
  }

  async register(userData: NewAuth & { password: string }) {
    const { password, ...userInfo } = userData;

    const newUser = await this.db
      .insert(userTable)
      .values(userInfo)
      .returning();

    const hashedPassword = await bcrypt.hash(password, 10);
    const authData: Auth = {
      userId: newUser[0].id,
      password: hashedPassword,
    };

    await this.db.insert(authTable).values(authData);

    const accessToken = this.generateAccessToken(newUser[0].id);
    const refreshToken = this.generateRefreshToken(newUser[0].id);

    await this.db
      .update(authTable)
      .set({ refreshToken })
      .where(eq(authTable.userId, newUser[0].id));

    return { user: newUser[0], accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as {
        userId: string;
      };
      const auth = await this.db
        .select()
        .from(authTable)
        .where(eq(authTable.userId, decoded.userId))
        .limit(1);

      if (!auth[0] || auth[0].refreshToken !== refreshToken) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const newAccessToken = this.generateAccessToken(auth[0].userId);
      const newRefreshToken = this.generateRefreshToken(auth[0].userId);

      await this.db
        .update(authTable)
        .set({ refreshToken: newRefreshToken })
        .where(eq(authTable.userId, auth[0].userId));

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async logout(userId: string) {
    await this.db
      .update(authTable)
      .set({ refreshToken: null })
      .where(eq(authTable.userId, userId));
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: "15m" });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  }
}
