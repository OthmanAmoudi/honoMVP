// customFieldsMysql.ts
import { varchar, datetime } from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

// Custom ID column with nanoid for MySQL
export const nanoidIdColumn = () =>
  varchar("id", { length: 256 }).primaryKey().$defaultFn(nanoid);

// Custom createdAt column for MySQL
export const createdAtColumn = () =>
  datetime("createdAt")
    .notNull()
    .$default(() => new Date());

// Custom updatedAt column for MySQL
export const updatedAtColumn = () =>
  datetime("updatedAt")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date());
