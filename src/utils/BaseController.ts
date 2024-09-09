// src/controllers/BaseController.ts
import { Context } from "hono";
import BaseService from "./BaseService";
import { ValidationError, NotFoundError, DatabaseError } from "./errors";
export default abstract class BaseController<T extends BaseService> {
  constructor(protected service: T) {}

  protected async handleErrors(c: Context, action: () => Promise<any>) {
    try {
      return await action();
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: error.message, details: error.details }, 400);
      }
      if (error instanceof NotFoundError) {
        return c.json({ error: error.message }, 404);
      }
      if (error instanceof DatabaseError) {
        return c.json({ error: "A database error occurred" }, 500);
      }
      console.error("Unhandled error:", error);
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }

  getAll = async (c: Context) => {
    return this.handleErrors(c, async () => {
      const items = await this.service.getAll();
      return c.json(items);
    });
  };

  getById = async (c: Context) => {
    return this.handleErrors(c, async () => {
      const id = c.req.param("id");
      const item = await this.service.getById(id);
      return c.json(item);
    });
  };

  create = async (c: Context) => {
    return this.handleErrors(c, async () => {
      const data = await c.req.json();
      const newItem = await this.service.create(data);
      return c.json(newItem, 201);
    });
  };

  update = async (c: Context) => {
    return this.handleErrors(c, async () => {
      const id = c.req.param("id");
      const data = await c.req.json();
      const updatedItem = await this.service.update(id, data);
      return c.json(updatedItem);
    });
  };

  delete = async (c: Context) => {
    return this.handleErrors(c, async () => {
      const id = c.req.param("id");
      await this.service.delete(id);
      c.status(204);
      return c.body(null);
    });
  };
  // Method to get extra routes
  getExtraRoutes(): {
    method: string;
    path: string;
    handler: (c: Context) => Promise<any>;
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
          ].includes(name)
      )
      .map((name) => {
        const method = Reflect.getMetadata("method", proto, name) || "get";
        const path = Reflect.getMetadata("path", proto, name);
        const middlewares =
          Reflect.getMetadata("middlewares", proto, name) || [];

        if (!path) {
          console.warn(
            `No path specified for method ${name}. This route will not be registered.`
          );
          return null;
        }

        return {
          method,
          path,
          handler: (c: Context) => (this as any)[name](c),
          middlewares,
        };
      })
      .filter((route) => route !== null);
    return extraRoutes;
  }
}
