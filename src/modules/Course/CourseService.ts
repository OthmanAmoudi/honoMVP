
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertCourseSchema,
  UpdateCourseSchema,
  NewCourse,
  courseTable,
  UpdateCourse,
  Course,
} from "./CourseModel";

export default class CourseService extends BaseService {
  
  async getAll(cursor?: string, limit: number = 3): Promise<Course[]> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(courseTable)
        .where(cursor ? gt(courseTable.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(courseTable.id));
      return result;
    });
  }

  async getById(id: string): Promise<Course> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(courseTable)
        .where(eq(courseTable.id, id));

      if (!result.length)
        throw new NotFoundError(`Resource Course with id ${id} not found`);
      return result[0];
    });
  }

  async create(data: NewCourse): Promise<Course> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(InsertCourseSchema, data);
      const createdId = await this.db
        .insert(courseTable)
        .values(cleanedData)
        .$returningId();
      const result = await this.getById(createdId[0].id);
      return result;
    });
  }

  async update(id: string, data: Partial<NewCourse>): Promise<Course> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(UpdateCourseSchema, data);
      const updatedId = await this.db
        .update(courseTable)
        .set(cleanedData)
        .where(eq(courseTable.id, id));
      if (!updatedId[0].affectedRows) {
        throw new NotFoundError(`Resource Course with id ${id} not found`);
      }
      const result = await this.getById(id);
      return result;
    });
  }

  async delete(id: string): Promise<void> {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(courseTable)
        .where(eq(courseTable.id, id));
      if (!result[0].affectedRows) {
        throw new NotFoundError(`Resource Course with id ${id} not found`);
      }
    });
  }
  
}
