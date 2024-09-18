import { eq, asc, gt } from "drizzle-orm";
import { BaseService } from "../../utils/BaseService";
import { Todo, NewTodo, todosTable, TodoInsertSchema } from "./TodoModel";
import { NotFoundError } from "../../utils";

export default class TodoService extends BaseService {
  async getAll(cursor?: string, limit: number = 3): Promise<Todo[]> {
    const result = await this.db
      .select()
      .from(todosTable)
      .where(cursor ? gt(todosTable.id, cursor) : undefined)
      .limit(limit)
      .orderBy(asc(todosTable.id));
    return result;
  }

  async getById(id: string): Promise<Todo> {
    const result = await this.db
      .select()
      .from(todosTable)
      .where(eq(todosTable.id, id));

    if (!result.length) {
      throw new NotFoundError(`Resource Todo with id ${id} not found`);
    }
    return result[0];
  }

  async create(data: NewTodo): Promise<Todo> {
    const cleanedData = this.validate(TodoInsertSchema, data);
    const createdId = await this.db
      .insert(todosTable)
      .values(cleanedData)
      .$returningId();
    const result = await this.getById(createdId[0].id);
    return result;
  }

  async update(id: string, data: Partial<NewTodo>): Promise<Todo> {
    const cleanedData = this.validate(TodoInsertSchema, data);
    const updatedId = await this.db
      .update(todosTable)
      .set(cleanedData)
      .where(eq(todosTable.id, id));
    if (!updatedId[0].affectedRows) {
      throw new NotFoundError(`Resource Todo with id ${id} not found`);
    }
    const result = await this.getById(id);
    return result;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(todosTable)
      .where(eq(todosTable.id, id));
    if (!result[0].affectedRows) {
      throw new NotFoundError(`Resource Todo with id ${id} not found`);
    }
  }
}
