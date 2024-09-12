import { Static, Type } from "@sinclair/typebox";
import { createSelectSchema } from "drizzle-typebox";
import {
  createdAtColumn,
  nanoidIdColumn,
  updatedAtColumn,
} from "../../db/customefields-postgresql";
import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const todosTable = pgTable("todos", {
  id: nanoidIdColumn(),
  content: text("content").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
// Create TypeBox schemas for todos
export const TodoSchema = createSelectSchema(todosTable);
// for post request: only content is required, completed is optional, extra fields are ignored
// for put request: all fields are optional, but if provided, they must match the schema
export const InsertTodoSchema = Type.Object({
  content: Type.String(),
  completed: Type.Optional(Type.Boolean()),
});
export const UpdateTodoSchema = Type.Partial(InsertTodoSchema);

// Types based on the TypeBox schemas
export type Todo = Static<typeof TodoSchema>;
export type NewTodo = Static<typeof InsertTodoSchema>;
export type UpdateTodo = Static<typeof UpdateTodoSchema>;
