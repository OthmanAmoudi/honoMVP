import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import {
  createdAtColumn,
  nanoidIdColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import * as v from "valibot";

export const todosTable = sqliteTable("todos", {
  id: nanoidIdColumn(),
  content: text("content").notNull(),
  completed: integer("completed").notNull().default(0),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
// Create TypeBox schemas for todos
export const TodoSchema = createSelectSchema(todosTable);
// for post request: only content is required, completed is optional, extra fields are ignored
// for put request: all fields are optional, but if provided, they must match the schema
// export const TodoInsertSchema = createInsertSchema(todosTable);
export const TodoInsertSchema = v.object({
  content: v.string(),
  completed: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(1))),
});
// export const UpdateTodoSchema = Type.Partial(InsertTodoSchema);

// Types based on the TypeBox schemas
export type Todo = typeof TodoSchema;
export type NewTodo = typeof TodoInsertSchema;
export type UpdateTodo = typeof TodoInsertSchema;
