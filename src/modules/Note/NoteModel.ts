import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-mysql";
import { createSelectSchema } from "drizzle-valibot";
import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { userTable } from "../User/UserModel";
import * as v from "valibot";

// Example table that extends with common fields
export const notesTable = mysqlTable("notes", {
  id: nanoidIdColumn(),
  description: varchar("description", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => userTable.id),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
// Create TypeBox schemas for notes
export const NoteSchema = createSelectSchema(notesTable);

export const InsertNoteSchema = v.object({
  description: v.pipe(v.string(), v.minLength(3), v.maxLength(50)),
  userId: v.string(),
});

export const UpdateNoteSchema = InsertNoteSchema;
export type Note = typeof NoteSchema;
export type NewNote = typeof InsertNoteSchema;
export type UpdateNote = typeof UpdateNoteSchema;
