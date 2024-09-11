
import { text, mysqlTable } from "drizzle-orm/mysql-core";

import {
  nanoidIdColumn,
  createdAtColumn,
  updatedAtColumn,
} from "../../db/customefields-mysql";
import { createSelectSchema } from "drizzle-typebox";
import { Static, Type } from "@sinclair/typebox";

export const courseTable = mysqlTable("course", {
  id: nanoidIdColumn(),
  description: text("description").notNull(),
  // Add other fields as needed
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const CourseSchema = createSelectSchema(courseTable);
export const InsertCourseSchema = Type.Object({
  description: Type.String({ minLength: 2, maxLength: 50 }),
  // Define insert schema
});
export const UpdateCourseSchema = InsertCourseSchema;

export type Course = Static<typeof CourseSchema>;
export type NewCourse = Static<typeof InsertCourseSchema>;
export type UpdateCourse = Static<typeof UpdateCourseSchema>;
