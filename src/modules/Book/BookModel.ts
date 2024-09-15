// src/modules/Book/BookModel.ts
import { text, pgTable } from "drizzle-orm/pg-core";

import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";

export const bookTable = pgTable("books", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const BookSchema = createSelectSchema(bookTable);
export const InsertBookSchema = Type.Object({
  description: Type.String({ minLength: 2, maxLength: 50 }),
  // Define insert schema
});
export const UpdateBookSchema = InsertBookSchema;

export type Book = Static<typeof BookSchema>;
export type NewBook = Static<typeof InsertBookSchema>;
export type UpdateBook = Static<typeof UpdateBookSchema>;
