// src/services/TodoService.ts
import { eq } from "drizzle-orm";
import { BaseService } from "../utils/BaseService";
import { todosTable } from "../db/models/todoModel";
import { z } from "zod";
import { NotFoundError } from "../utils/errors";

const todoSchema = z.object({
  content: z.string().min(1),
  completed: z.boolean().optional(),
});

export class TodoService extends BaseService {
  async getAll() {
    return this.handleErrors(async () => {
      return await this.db.select().from(todosTable);
    });
  }

  async getById(id: number) {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(todosTable)
        .where(eq(todosTable.id, id));
      if (!result[0]) {
        throw new NotFoundError(`Todo with id ${id} not found`);
      }
      return result[0];
    });
  }

  async create(data: z.infer<typeof todoSchema>) {
    return this.handleErrors(async () => {
      const validatedData = todoSchema.parse(data);
      const result = await this.db
        .insert(todosTable)
        .values(validatedData)
        .returning();
      return result[0];
    });
  }

  async update(id: number, data: Partial<z.infer<typeof todoSchema>>) {
    return this.handleErrors(async () => {
      const validatedData = todoSchema.partial().parse(data);
      const result = await this.db
        .update(todosTable)
        .set(validatedData)
        .where(eq(todosTable.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError(`Todo with id ${id} not found`);
      }
      return result[0];
    });
  }

  async delete(id: number) {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(todosTable)
        .where(eq(todosTable.id, id))
        .returning();
      if (!result[0]) {
        throw new NotFoundError(`Todo with id ${id} not found`);
      }
    });
  }
}
