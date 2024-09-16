// src/controllers/BaseController.ts
import { Context } from "hono";
import { BaseService } from "../utils/BaseService";
import { Logger } from "../utils/Logger";
import { withErrorHandler } from "../utils/errors";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 14;

export abstract class BaseController {
  protected service: any;

  constructor(service: any) {
    this.service = service;
    // Bind and wrap methods with error handling
    this.getAll = this.handleErrors(this.getAll.bind(this));
    this.getById = this.handleErrors(this.getById.bind(this));
    this.create = this.handleErrors(this.create.bind(this));
    this.update = this.handleErrors(this.update.bind(this));
    this.delete = this.handleErrors(this.delete.bind(this));

    // Bind and wrap extra routes if any
    this.bindExtraRoutes();
  }

  /**
   * Error handling wrapper for controller methods.
   * @param fn The controller method to wrap.
   */
  protected handleErrors(
    fn: (c: Context) => Promise<Response>
  ): (c: Context) => Promise<Response> {
    return async (c: Context) => {
      try {
        return await fn(c);
      } catch (error) {
        // Log the error
        return withErrorHandler(error, c);
      }
    };
  }

  /**
   * Binds and wraps extra route methods with error handling.
   */
  private bindExtraRoutes() {
    const proto = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(proto);

    const standardMethods = [
      "constructor",
      "getAll",
      "getById",
      "create",
      "update",
      "delete",
      "getExtraRoutes",
      "handleErrors",
      "bindExtraRoutes",
    ];

    methodNames.forEach((name) => {
      if (
        !standardMethods.includes(name) &&
        typeof (this as any)[name] === "function"
      ) {
        // Bind and wrap the method
        (this as any)[name] = this.handleErrors((this as any)[name].bind(this));
      }
    });
  }

  async getAll(c: Context): Promise<Response> {
    let cursor: string | number | undefined = c.req.query("cursor");
    if (cursor && !isNaN(Number(cursor))) {
      cursor = Number(cursor);
    }

    let limit = Number(c.req.query("limit")) || DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    const items = await this.service.getAll?.(cursor, limit);
    const nextCursor =
      items && items.length === limit
        ? (items[items.length - 1] as any).id
        : null;

    return c.json({ items, nextCursor });
  }

  async getById(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const item = await this.service.getById?.(id);
    return c.json(item);
  }

  async create(c: Context): Promise<Response> {
    const data = await c.req.json();
    const newItem = await this.service.create?.(data);
    return c.json(newItem, 201);
  }

  async update(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const data = await c.req.json();
    const updatedItem = await this.service.update?.(id, data);
    return c.json(updatedItem);
  }

  async delete(c: Context): Promise<Response> {
    const id = c.req.param("id");
    await this.service.delete?.(id);
    return c.body(null, 204);
  }

  public getExtraRoutes(): {
    method: string;
    path: string;
    handler: (c: Context) => Promise<any>;
    handlerName: string;
    middlewares?: any[];
  }[] {
    const proto = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(proto);

    // const standardMethods = [
    //   "constructor",
    //   "getAll",
    //   "getById",
    //   "create",
    //   "update",
    //   "delete",
    //   "getExtraRoutes",
    //   "handleErrors",
    //   "bindExtraRoutes",
    // ];

    const extraRoutes = methodNames
      .filter(
        (name) =>
          // !standardMethods.includes(name) &&
          typeof (this as any)[name] === "function"
      )
      .map((name) => {
        const method = Reflect.getMetadata("method", proto, name) || "get";
        const path = Reflect.getMetadata("path", proto, name);
        const middlewares =
          Reflect.getMetadata("middlewares", proto, name) || [];

        if (path === undefined || path === null) {
          Logger.warn(
            `No path specified for method ${name}. This route will not be registered.`
          );
          return null;
        }

        // The method is already bound and wrapped with error handling
        const handler = (this as any)[name];

        return {
          method,
          path,
          handler,
          handlerName: name,
          middlewares,
        };
      })
      .filter((route) => route !== null);

    return extraRoutes as any;
  }
}
