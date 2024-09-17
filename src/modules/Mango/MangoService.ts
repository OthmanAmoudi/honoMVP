
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertMangoSchema,
  UpdateMangoSchema,
  NewMango,
  mangoTable,
  UpdateMango,
  Mango,
} from "./MangoModel";

export default class MangoService extends BaseService {
  
  async getAll(cursor?: string, limit: number = 8): Promise<Mango[]> {
      const result = await this.db
        .select()
        .from(mangoTable)
        .where(cursor ? gt(mangoTable.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(mangoTable.id));
      return result;
  }

  async getById(id: string) {
      const result = await this.db
        .select()
        .from(mangoTable)
        .where(eq(mangoTable.id, id));
      if (!result[0]) {
        throw new NotFoundError("Resource Mango with id "+id+" not found");
      }
      return result[0];
  }

  async create(data: NewMango) {
      const cleanedData = this.validate(InsertMangoSchema, data);
      const result = await this.db
        .insert(mangoTable)
        .values(cleanedData)
        .returning();
      return result[0];
  }

  async update(id: string, data: UpdateMango) {
      const cleanedData = this.validate(UpdateMangoSchema, data);
      const result = await this.db
        .update(mangoTable)
        .set(cleanedData)
        .where(eq(mangoTable.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError("Resource Mango with id "+id+" not found");
      }
      return result[0];
  }

  async delete(id: string) {
      const result = await this.db
        .delete(mangoTable)
        .where(eq(mangoTable.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError("Resource Mango with id "+id+" not found");
      }
  }
  
}
