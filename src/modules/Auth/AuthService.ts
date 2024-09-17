// src/modules/Auth/AuthService.ts
import { NotFoundError, BaseService, UnauthorizedError } from "../../utils";
import { eq } from "drizzle-orm";
import { userTable, NewUser } from "../User/UserModel";
import { authTable, NewAuth, AuthSchema, Auth } from "./AuthModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export default class AuthService extends BaseService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  private readonly JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret";
  private readonly ACCESS_TOKEN_EXPIRY = "15m";
  private readonly REFRESH_TOKEN_EXPIRY = "7d";
  private readonly FORCE_REAUTH_AFTER = 30 * 24 * 60 * 60 * 1000; // 30 days

  async getUserByEmail(email: string) {
    const user = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    return user[0];
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
    const refreshToken = this.generateRefreshToken(newUser[0].id, "xAx");

    await this.db
      .update(authTable)
      .set({ refreshToken })
      .where(eq(authTable.userId, newUser[0].id));

    return { user: newUser[0], accessToken, refreshToken };
  }

  async login(email: string, password: string, clientId?: string) {
    if (!clientId) {
      clientId = "" + Math.random();
    }
    //TODO: Move password to auth table
    const user = await this.getUserByEmail(email);
    const auth = await this.db
      .select()
      .from(authTable)
      .where(eq(authTable.userId, user.id))
      .limit(1);
    if (!user || !(await bcrypt.compare(password, auth[0].password))) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id, clientId);
    const refreshTokenFamily = crypto.randomBytes(16).toString("hex");

    await this.db
      .update(authTable)
      .set({
        refreshToken: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiresAt:
          "" + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        refreshTokenFamily,
        lastAuthentication: "" + new Date(),
      })
      .where(eq(authTable.userId, user.id));

    return { accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string, clientId?: string) {
    if (!clientId) {
      clientId = "" + "Math.random()";
    }
    try {
      const decoded = jwt.verify(oldRefreshToken, this.JWT_REFRESH_SECRET) as {
        userId: string;
        clientId: string;
      };
      if (decoded.clientId !== clientId) {
        throw new UnauthorizedError("Invalid client");
      }

      const auth = await this.db
        .select()
        .from(authTable)
        .where(eq(authTable.userId, decoded.userId))
        .limit(1);

      if (
        !auth[0] ||
        !(await bcrypt.compare(oldRefreshToken, auth[0].refreshToken!)) ||
        new Date() > new Date(auth[0].refreshTokenExpiresAt!)
      ) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      if (
        new Date().getTime() - new Date(auth[0].lastAuthentication!).getTime() >
        this.FORCE_REAUTH_AFTER
      ) {
        throw new UnauthorizedError("Re-authentication required");
      }

      const accessToken = this.generateAccessToken(auth[0].userId);
      const refreshToken = this.generateRefreshToken(auth[0].userId, clientId);

      await this.db
        .update(authTable)
        .set({
          refreshToken: await bcrypt.hash(refreshToken, 10),
          refreshTokenExpiresAt:
            "" + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .where(eq(authTable.userId, auth[0].userId));

      return { accessToken, refreshToken };
    } catch (error) {
      // If token is invalid, revoke the entire refresh token family
      if (error instanceof jwt.JsonWebTokenError) {
        await this.revokeRefreshTokenFamily(oldRefreshToken);
      }
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async logout(userId: string) {
    await this.db
      .update(authTable)
      .set({
        refreshToken: null,
        refreshTokenExpiresAt: null,
        refreshTokenFamily: null,
      })
      .where(eq(authTable.userId, userId));
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(userId: string, clientId: string): string {
    return jwt.sign({ userId, clientId }, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  private async revokeRefreshTokenFamily(token: string) {
    try {
      const decoded = jwt.decode(token) as { userId: string };
      if (decoded && decoded.userId) {
        await this.db
          .update(authTable)
          .set({
            refreshToken: null,
            refreshTokenExpiresAt: null,
            refreshTokenFamily: null,
          })
          .where(eq(authTable.userId, decoded.userId));
      }
    } catch (error) {
      console.error("Error revoking refresh token family:", error);
    }
  }
}
