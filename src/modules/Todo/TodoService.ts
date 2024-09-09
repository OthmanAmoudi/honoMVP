// src/services/TodoService.ts
import { Type } from "@sinclair/typebox";
import { eq } from "drizzle-orm";
import { todosTable } from "./TodoModel";
import BaseService from "../../utils/BaseService";
import { InsertTodoSchema, Todo, UpdateTodoSchema, NewTodo } from "./TodoModel";
import { NotFoundError } from "../../utils/Errors";

// Define the TodoService that extends BaseService
export class TodoService extends BaseService {
  // Create a new todo
  async create(data: NewTodo): Promise<Todo> {
    return this.handleErrors(async () => {
      // Validate the incoming request using TypeBox schema
      this.validate(InsertTodoSchema, data);

      const result = await this.db.insert(todosTable).values(data).returning();

      return result[0];
    });
  }

  // Update an existing todo
  async update(id: string, data: Partial<NewTodo>): Promise<Todo> {
    return this.handleErrors(async () => {
      this.validate(UpdateTodoSchema, data);

      const result = await this.db
        .update(todosTable)
        .set(data)
        .where(eq(todosTable.id, Number(id)))
        .returning();

      if (!result.length) throw new NotFoundError("Todo not found");
      return result[0];
    });
  }

  // Fetch a todo by ID
  async getById(id: string): Promise<Todo> {
    return this.handleErrors(async () => {
      const result = await this.db
        .select()
        .from(todosTable)
        .where(eq(todosTable.id, Number(id)));

      if (!result.length) throw new NotFoundError("Todo not found");
      return result[0];
    });
  }

  // Fetch all todos
  async getAll(): Promise<Todo[]> {
    return this.handleErrors(async () => {
      const result = await this.db.select().from(todosTable);
      return result;
    });
  }

  // Delete a todo by ID
  async delete(id: string): Promise<void> {
    return this.handleErrors(async () => {
      const result = await this.db
        .delete(todosTable)
        .where(eq(todosTable.id, Number(id)))
        .returning();

      if (!result.length) throw new NotFoundError("Todo not found");
    });
  }
}
