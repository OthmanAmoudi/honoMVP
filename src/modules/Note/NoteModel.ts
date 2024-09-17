import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-valibot";
import { pgTable, text } from "drizzle-orm/pg-core";
import { userTable } from "../User/UserModel";
import * as v from "valibot";

// Example table that extends with common fields
export const notesTable = pgTable("notes", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  userId: text("user_id")
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
