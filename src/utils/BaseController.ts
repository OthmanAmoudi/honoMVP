// src/controllers/BaseController.ts
import { Context } from "hono";
import { ValidationError, NotFoundError, DatabaseError } from "./Errors";

export abstract class BaseController {
  protected service: any;

  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async getAll(c: Context): Promise<Response> {
    // Extract cursor and limit from query parameters
    let cursor: string | number | undefined = c.req.query("cursor");
    // If cursor can be converted to a number, convert it; otherwise, keep it as a string or undefined
    if (cursor && !isNaN(Number(cursor))) {
      cursor = Number(cursor);
    }
    // Extract limit and ensure it doesn't exceed 12, defaulting to 10 if not provided
    let limit = c.req.query("limit") ? Number(c.req.query("limit")) : 10;
    if (limit > 14) {
      limit = 14;
    }
    const items = await this.service.getAll(cursor, limit);
    return c.json({
      items,
      nextCursor: items.length === limit ? items[items.length - 1].id : null,
    });
  }

  public async getById(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const item = await this.service.getById(id);
    return c.json(item);
  }

  public async create(c: Context): Promise<Response> {
    const data = await c.req.json();
    const newItem = await this.service.create(data);
    return c.json(newItem, 201);
  }

  public async update(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const data = await c.req.json();
    const updatedItem = await this.service.update(id, data);
    return c.json(updatedItem);
  }

  public async delete(c: Context): Promise<Response> {
    const id = c.req.param("id");
    await this.service.delete(id);
    c.status(204);
    return c.body(null);
  }
  getExtraRoutes(): {
    method: string;
    path: string;
    handler: (c: Context) => Promise<any>;
    handlerName: string;
    middlewares?: any[];
  }[] {
    const proto = Object.getPrototypeOf(this);
    const extraRoutes = Object.getOwnPropertyNames(proto)
      .filter(
        (name) =>
          ![
            "constructor",
            "getAll",
            "getById",
            "create",
            "update",
            "delete",
            "getExtraRoutes",
            "handleResponse",
          ].includes(name)
      )
      .map((name) => {
        const method = Reflect.getMetadata("method", proto, name) || "get";
        const path = Reflect.getMetadata("path", proto, name);
        const middlewares =
          Reflect.getMetadata("middlewares", proto, name) || [];

        if (path === undefined || path === null) {
          console.warn(
            `No path specified for method ${name}. This route will not be registered.`
          );
          return null;
        }

        return {
          method,
          path,
          handler: (c: Context) => (this as any)[name](c),
          handlerName: name,
          middlewares,
        };
      })
      .filter((route) => route !== null);
    return extraRoutes as any;
  }
}
