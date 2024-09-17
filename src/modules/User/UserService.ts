// src/modules/User/UserService.ts
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertUserSchema,
  UpdateUserSchema,
  NewUser,
  userTable,
  UpdateUser,
  User,
} from "./UserModel";

export default class UserService extends BaseService {
  async getAll(cursor?: string, limit: number = 8): Promise<User[]> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(cursor ? gt(userTable.id, cursor) : undefined)
      .limit(limit)
      .orderBy(asc(userTable.id));
    return result;
  }

  async getById(id: string) {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id));
    if (!result[0]) {
      throw new NotFoundError("Resource User with id " + id + " not found");
    }
    return result[0];
  }

  async create(data: NewUser) {
    const cleanedData = this.validate(InsertUserSchema, data);
    const result = await this.db
      .insert(userTable)
      .values(cleanedData)
      .returning();
    return result[0];
  }

  async update(id: string, data: UpdateUser) {
    const cleanedData = this.validate(UpdateUserSchema, data);
    const result = await this.db
      .update(userTable)
      .set(cleanedData)
      .where(eq(userTable.id, id))
      .returning();
    if (!result[0]) {
      throw new NotFoundError("Resource User with id " + id + " not found");
    }
    return result[0];
  }

  async delete(id: string) {
    const result = await this.db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();
    if (!result[0]) {
      throw new NotFoundError("Resource User with id " + id + " not found");
    }
  }
}
