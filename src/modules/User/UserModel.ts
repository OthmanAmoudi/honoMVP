// src/modules/User/UserModel.ts
import { text, pgTable } from "drizzle-orm/pg-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

export const userTable = pgTable("users", {
  id: nanoidIdColumn(),
  email: text("email").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const UserSchema = createSelectSchema(userTable);
export const InsertUserSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
});
export const UpdateUserSchema = v.partial(InsertUserSchema);

export type User = typeof UserSchema;
export type NewUser = typeof InsertUserSchema;
export type UpdateUser = typeof UpdateUserSchema;
