// customFieldsMysql.ts
import { text, datetime } from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

// Custom ID column with nanoid for MySQL
export const nanoidIdColumn = () =>
  text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => nanoid());

// Custom createdAt column for MySQL
export const createdAtColumn = () =>
  datetime("createdAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);

// Custom updatedAt column for MySQL
export const updatedAtColumn = () =>
  datetime("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`);
