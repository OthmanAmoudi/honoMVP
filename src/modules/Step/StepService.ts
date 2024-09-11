
import { NotFoundError, BaseService } from "../../utils";
import { eq, gt, asc } from "drizzle-orm";
import {
  InsertStepSchema,
  UpdateStepSchema,
  NewStep,
  stepTable,
  UpdateStep,
  Step,
} from "./StepModel";

export default class StepService extends BaseService {
  
  async getAll(cursor?: string, limit: number = 3): Promise<Step[]> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(stepTable)
        .where(cursor ? gt(stepTable.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(stepTable.id));
      return result;
    });
  }

  async getById(id: string): Promise<Step> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(stepTable)
        .where(eq(stepTable.id, id));

      if (!result.length)
        throw new NotFoundError(`Resource Step with id ${id} not found`);
      return result[0];
    });
  }

  async create(data: NewStep): Promise<Step> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(InsertStepSchema, data);
      const createdId = await this.db
        .insert(stepTable)
        .values(cleanedData)
        .$returningId();
      const result = await this.getById(createdId[0].id);
      return result;
    });
  }

  async update(id: string, data: Partial<NewStep>): Promise<Step> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(UpdateStepSchema, data);
      const updatedId = await this.db
        .update(stepTable)
        .set(cleanedData)
        .where(eq(stepTable.id, id));
      if (!updatedId[0].affectedRows) {
        throw new NotFoundError(`Resource Step with id ${id} not found`);
      }
      const result = await this.getById(id);
      return result;
    });
  }

  async delete(id: string): Promise<void> {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(stepTable)
        .where(eq(stepTable.id, id));
      if (!result[0].affectedRows) {
        throw new NotFoundError(`Resource Step with id ${id} not found`);
      }
    });
  }
  
}
