import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const todosTable = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Create Zod schema for inserting todos
export const insertTodoSchema = createInsertSchema(todosTable).omit({
  id: true,
  createdAt: true,
});

// Create Zod schema for selecting todos
export const selectTodoSchema = createSelectSchema(todosTable).omit({
  createdAt: true,
});

// Types based on the Zod schemas
export type Todo = z.infer<typeof selectTodoSchema>;
export type NewTodo = z.infer<typeof insertTodoSchema>;

// Additional schema for update operations
export const updateTodoSchema = insertTodoSchema.partial();
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
