// src/controllers/BaseController.ts
import { Context } from "hono";
import { BaseService } from "../utils/BaseService";
import { ValidationError, NotFoundError, DatabaseError } from "../utils/errors";

export abstract class BaseController {
  constructor(protected service: BaseService) {}

  protected handleErrors(c: Context, error: unknown) {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message, details: error.details }, 400);
    }
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof DatabaseError) {
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
    console.error("Unhandled error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }

  getAll = async (c: Context) => {
    try {
      const items = await this.service.getAll();
      return c.json(items);
    } catch (error) {
      return this.handleErrors(c, error);
    }
  };

  getById = async (c: Context) => {
    try {
      const id = Number(c.req.param("id"));
      const item = await this.service.getById(id);
      return c.json(item);
    } catch (error) {
      return this.handleErrors(c, error);
    }
  };

  create = async (c: Context) => {
    try {
      const data = await c.req.json();
      const newItem = await this.service.create(data);
      return c.json(newItem, 201);
    } catch (error) {
      return this.handleErrors(c, error);
    }
  };

  update = async (c: Context) => {
    try {
      const id = Number(c.req.param("id"));
      const data = await c.req.json();
      const updatedItem = await this.service.update(id, data);
      return c.json(updatedItem);
    } catch (error) {
      return this.handleErrors(c, error);
    }
  };

  delete = async (c: Context) => {
    try {
      const id = Number(c.req.param("id"));
      await this.service.delete(id);
      return c.status(204);
    } catch (error) {
      return this.handleErrors(c, error);
    }
  };
}
