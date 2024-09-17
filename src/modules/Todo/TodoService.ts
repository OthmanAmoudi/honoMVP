// src/services/TodoService.ts
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

  // Fetch a todo by ID
  async getById(id: string): Promise<Todo> {
    const result = await this.db
      .select()
      .from(todosTable)
      .where(eq(todosTable.id, id)); // convert to number if your id is a number e.g Number(id)

    if (!result.length)
      throw new NotFoundError(`Resource with id ${id} not found`);
    return result[0];
  }

  // Create a new todo
  async create(data: NewTodo): Promise<Todo> {
    // Validate the incoming request using TypeBox schema
    const cleanedData = this.validate(TodoInsertSchema, data);
    console.log({ cleanedData });
    const result = await this.db
      .insert(todosTable)
      .values(cleanedData)
      .returning();
    return result[0];
  }

  // Update an existing todo
  async update(id: string, data: Partial<NewTodo>): Promise<Todo> {
    const cleanedData = this.validate(TodoInsertSchema, data);
    const result = await this.db
      .update(todosTable)
      .set(cleanedData)
      .where(eq(todosTable.id, id)) // convert to number if your id is a number e.g Number(id)
      .returning();
    if (!result.length)
      throw new NotFoundError(`Resource with id ${id} not found`);
    return result[0];
  }

  // Delete a todo by ID
  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(todosTable)
      .where(eq(todosTable.id, id)) // convert to number if your id is a number e.g Number(id)
      .returning();
    if (!result.length)
      throw new NotFoundError(`Resource with id ${id} not found`);
  }
}
