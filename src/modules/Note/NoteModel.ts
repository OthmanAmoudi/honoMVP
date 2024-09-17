import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";
import { pgTable, text } from "drizzle-orm/pg-core";
import { userTable } from "../User/UserModel";

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

export const InsertNoteSchema = Type.Object({
  description: Type.String({ minLength: 2, maxLength: 50 }),
  userId: Type.String(),
});

export const UpdateNoteSchema = InsertNoteSchema;
export type Note = Static<typeof NoteSchema>;
export type NewNote = Static<typeof InsertNoteSchema>;
export type UpdateNote = Static<typeof UpdateNoteSchema>;
