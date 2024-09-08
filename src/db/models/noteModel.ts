import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "./customefields";

// Example table that extends with common fields
export const notesTable = sqliteTable("notes", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
