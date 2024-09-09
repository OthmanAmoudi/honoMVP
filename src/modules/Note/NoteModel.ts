import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/customefields";
import { createSelectSchema, createInsertSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";

// Example table that extends with common fields
export const notesTable = sqliteTable("notes", {
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
