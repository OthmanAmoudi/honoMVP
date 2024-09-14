// src/controllers/TodoController.ts

import { BaseController } from "../../utils/BaseController";
import TodoService from "./TodoService";

export default class TodoController extends BaseController {
  static services = [TodoService];

  constructor(public todoService: TodoService) {
    super(todoService);
  }
}
