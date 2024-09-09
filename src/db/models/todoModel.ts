import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { Static, Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const todosTable = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
// Create TypeBox schemas for todos
export const TodoSchema = createSelectSchema(todosTable);
export const InsertTodoSchema = createInsertSchema(todosTable, {
  content: Type.String(),
  completed: Type.Optional(Type.Boolean()),
});
export const UpdateTodoSchema = Type.Partial(InsertTodoSchema);

// Types based on the TypeBox schemas
export type Todo = Static<typeof TodoSchema>;
export type NewTodo = Static<typeof InsertTodoSchema>;
export type UpdateTodo = Static<typeof UpdateTodoSchema>;
