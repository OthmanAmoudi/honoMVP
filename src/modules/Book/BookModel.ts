// src/modules/Book/BookModel.ts
// src/modules/Book/BookModel.ts
import { text, pgTable } from "drizzle-orm/pg-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";
export const bookTable = pgTable("books", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const BookSchema = createSelectSchema(bookTable);
export const InsertBookSchema = v.object({
  description: v.pipe(v.string(), v.minLength(2)),
  // Define insert schema
});
export const UpdateBookSchema = InsertBookSchema;

export type Book = typeof BookSchema;
export type NewBook = typeof InsertBookSchema;
export type UpdateBook = typeof UpdateBookSchema;
