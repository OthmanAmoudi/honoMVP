// src/modules/Auth/AuthModel.ts
import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-mysql";
import { createSelectSchema } from "drizzle-valibot";
import { userTable } from "../User/UserModel";
import * as v from "valibot";

export const authTable = mysqlTable("auth", {
  id: nanoidIdColumn(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => userTable.id),
  password: varchar("password", { length: 255 }).notNull(),
  refreshToken: varchar("refresh_token", { length: 255 }),
  refreshTokenExpiresAt: varchar("refresh_token_expires_at", { length: 255 }),
  refreshTokenFamily: varchar("refresh_token_family", { length: 255 }),
  lastAuthentication: varchar("last_authentication", { length: 255 }),
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
