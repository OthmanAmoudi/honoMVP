// src/modules/Auth/AuthModel.ts
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-sqlite";
import { createSelectSchema } from "drizzle-valibot";
import { userTable } from "../User/UserModel";
import * as v from "valibot";

export const authTable = sqliteTable("auth", {
  id: nanoidIdColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  password: text("password").notNull(),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: text("refresh_token_expires_at"),
  refreshTokenFamily: text("refresh_token_family"),
  lastAuthentication: text("last_authentication"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const AuthSchema = createSelectSchema(authTable);

export const InsertAuthSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export const UpdateAuthSchema = v.object({
  password: v.string(),
  refreshToken: v.string(),
});

export type Auth = v.InferOutput<typeof AuthSchema>;
export type NewAuth = v.InferOutput<typeof InsertAuthSchema>;
export type UpdateAuth = v.InferOutput<typeof UpdateAuthSchema>;

export const RegisterSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
  name: v.string(),
});

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

export const RefreshTokenSchema = v.object({
  refreshToken: v.string(),
});
