import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/customefields-mysql";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";
import { mysqlTable, text, int } from "drizzle-orm/mysql-core";

// Example table that extends with common fields
export const notesTable = mysqlTable("notes", {
  // mysql doesnt support returning after insert, this was made for specifically 'create' method in services
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
// Create TypeBox schemas for notes
export const NoteSchema = createSelectSchema(notesTable);
export const InsertNoteSchema = Type.Object({
  description: Type.String({ minLength: 2, maxLength: 50 }),
});
export const UpdateNoteSchema = InsertNoteSchema;
export type Note = Static<typeof NoteSchema>;
export type NewNote = Static<typeof InsertNoteSchema>;
export type UpdateNote = Static<typeof UpdateNoteSchema>;
