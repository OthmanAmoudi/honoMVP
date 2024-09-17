// customFieldsMysql.ts
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import { timestamp, text } from "drizzle-orm/pg-core";

// Custom ID column with nanoid for MySQL
export const nanoidIdColumn = () =>
  text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => nanoid());

// Custom createdAt column for MySQL
export const createdAtColumn = () =>
  timestamp("created_at").notNull().defaultNow();

// Custom updatedAt column for MySQL
export const updatedAtColumn = () =>
  timestamp("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`);
