
import { text, mysqlTable } from "drizzle-orm/mysql-core";

import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/customefields-mysql";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";

export const stepTable = mysqlTable("step", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const StepSchema = createSelectSchema(stepTable);
export const InsertStepSchema = Type.Object({
  description: Type.String({ minLength: 2, maxLength: 50 }),
  // Define insert schema
});
export const UpdateStepSchema = InsertStepSchema;

export type Step = Static<typeof StepSchema>;
export type NewStep = Static<typeof InsertStepSchema>;
export type UpdateStep = Static<typeof UpdateStepSchema>;
