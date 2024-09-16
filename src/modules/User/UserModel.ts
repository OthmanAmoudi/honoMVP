import { text, pgTable } from "drizzle-orm/pg-core";

import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";

export const userTable = pgTable("users", {
  id: nanoidIdColumn(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  token: text("token"),
  refreshToken: text("refreshToken"),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const UserSchema = createSelectSchema(userTable);
export const InsertUserSchema = Type.Object({
  email: Type.String({ minLength: 3, maxLength: 50 }),
  password: Type.String({ minLength: 8 }),
  // Define insert schema
});
export const UpdateUserSchema = InsertUserSchema;

export type User = Static<typeof UserSchema>;
export type NewUser = Static<typeof InsertUserSchema>;
export type UpdateUser = Static<typeof UpdateUserSchema>;
