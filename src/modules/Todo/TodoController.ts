// src/controllers/TodoController.ts

import BaseController from "../../utils/BaseController";
import { TodoService } from "./TodoService";

export default class TodoController extends BaseController<TodoService> {
  constructor(todoService: TodoService) {
    super(todoService);
  }
  //   // Add a custom method
  //   async getCompletedTodos(c: Context) {
  //     const completedTodos = await this.service.getCompleted();
  //     return c.json(completedTodos);
  //   }

  //   // Remove the 'override' keyword
  //   create = async (c: Context) => {
  //     const data = await c.req.json<NewTodo>();
  //     data.createdAt = new Date();
  //     const newItem = await this.service.create(data);
  //     return c.json(newItem, 201);
  //   };
}
