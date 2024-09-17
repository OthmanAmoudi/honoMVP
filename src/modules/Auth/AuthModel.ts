// src/modules/Auth/AuthModel.ts
import { text, pgTable } from "drizzle-orm/pg-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-valibot";
import { userTable } from "../User/UserModel";
import * as v from "valibot";

export const authTable = pgTable("auth", {
  id: nanoidIdColumn(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  password: text("password").notNull(),
  refreshToken: text("refresh_token"),
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
