// src/modules/User/UserModel.ts
import { text, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-mysql";
import { createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

export const userTable = mysqlTable("users", {
  id: nanoidIdColumn(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  bio: varchar("bio", { length: 255 }),
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
