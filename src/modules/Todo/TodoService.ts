// src/services/TodoService.ts
import { eq, asc, gt } from "drizzle-orm";
import { BaseService, NotFoundError } from "../../utils";
import {
  InsertTodoSchema,
  Todo,
  UpdateTodoSchema,
  NewTodo,
  todosTable,
} from "./TodoModel";

// Define the TodoService that extends BaseService
export class TodoService extends BaseService {
  // Fetch all todos
  async getAll(cursor?: string, limit: number = 3): Promise<Todo[]> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(todosTable)
        .where(cursor ? gt(todosTable.id, cursor) : undefined)
        .limit(limit)
        .orderBy(asc(todosTable.id));
      return result;
    });
  }

  // Fetch a todo by ID
  async getById(id: string): Promise<Todo> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(todosTable)
        .where(eq(todosTable.id, id)); // convert to number if your id is a number e.g Number(id)

      if (!result.length)
        throw new NotFoundError(`Resource with id ${id} not found`);
      return result[0];
    });
  }

  // Create a new todo
  async create(data: NewTodo): Promise<Todo> {
    return this.handleErrors(async () => {
      // Validate the incoming request using TypeBox schema
      const cleanedData = this.validate(InsertTodoSchema, data);
      const createdId = await this.db
        .insert(todosTable)
        .values(cleanedData)
        .$returningId();
      const result = await this.getById(createdId[0].id);
      return result;
    });
  }

  // Update an existing todo
  async update(id: string, data: Partial<NewTodo>): Promise<Todo> {
    return this.handleErrors(async () => {
      const cleanedData = this.validate(UpdateTodoSchema, data);
      const updatedId = await this.db
        .update(todosTable)
        .set(cleanedData)
        .where(eq(todosTable.id, id)); // convert to number if your id is a number e.g Number(id)
      // .returning();
      if (!updatedId[0].affectedRows) {
        throw new NotFoundError(`Resource with id ${id} not found`);
      }
      const result = await this.getById(id);
      return result;
    });
  }

  // Delete a todo by ID
  async delete(id: string): Promise<void> {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(todosTable)
        .where(eq(todosTable.id, id)); // convert to number if your id is a number e.g Number(id)
      // .returning();
      if (!result[0].affectedRows) {
        throw new NotFoundError(`Resource with id ${id} not found`);
      }
    });
  }
}
