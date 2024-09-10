import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { Static, Type } from "@sinclair/typebox";
import { createSelectSchema } from "drizzle-typebox";
import {
  createdAtColumn,
  nanoidIdColumn,
  updatedAtColumn,
} from "../../db/customefields";

export const todosTable = sqliteTable("todos", {
  id: nanoidIdColumn(),
  content: text("content").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
// Create TypeBox schemas for todos
export const TodoSchema = createSelectSchema(todosTable);
export const InsertTodoSchema = Type.Object({
  content: Type.String(),
  completed: Type.Optional(Type.Boolean()),
});
export const UpdateTodoSchema = Type.Partial(InsertTodoSchema);

// Types based on the TypeBox schemas
export type Todo = Static<typeof TodoSchema>;
export type NewTodo = Static<typeof InsertTodoSchema>;
export type UpdateTodo = Static<typeof UpdateTodoSchema>;
