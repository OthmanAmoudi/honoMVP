
import { text, pgTable } from "drizzle-orm/pg-core";

import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/fields/customefields-postgresql";
import { createSelectSchema } from "drizzle-valibot";
import * as v from 'valibot'

export const mangoTable = pgTable("mangos", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const MangoSchema = createSelectSchema(mangoTable);
export const InsertMangoSchema = v.object({
  description: v.pipe(v.string(),v.minLength(2), v.maxLength(50)),
  // Define insert schema
});
export const UpdateMangoSchema = InsertMangoSchema;

export type Mango = typeof MangoSchema;
export type NewMango = typeof InsertMangoSchema;
export type UpdateMango = typeof UpdateMangoSchema;
