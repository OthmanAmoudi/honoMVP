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
  timestamp("createdAt").notNull().defaultNow();

// Custom updatedAt column for MySQL
export const updatedAtColumn = () =>
  timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
