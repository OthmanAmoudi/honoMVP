import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// Custom ID column with nanoid
export const nanoidIdColumn = () =>
  text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => nanoid());

// Custom ID column with nanoid
export const createdAtColumn = () =>
  integer("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);

// Custom ID column with nanoid
export const updatedAtColumn = () =>
  integer("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`);
