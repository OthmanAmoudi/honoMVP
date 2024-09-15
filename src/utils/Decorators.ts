import "reflect-metadata";
import { Context } from "hono";

// Convenience decorators for common HTTP methods
export function Get(path: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    if (path === "/" || path === "//") path = "";

    // descriptor.value = async function (c: Context, ...args: any[]) {
    //   return errorHandler(() => originalMethod.apply(this, [c, ...args]), c);
    // };

    Reflect.defineMetadata(
      "method",
      "get",
      target.constructor.prototype,
      propertyKey
    );
    Reflect.defineMetadata(
      "path",
      path,
      target.constructor.prototype,
      propertyKey
    );
  };
}
export function Post(path: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    if (path === "/" || path === "//") path = "";

    // descriptor.value = async function (c: Context, ...args: any[]) {
    //   return errorHandler(() => originalMethod.apply(this, [c, ...args]), c);
    // };

    Reflect.defineMetadata(
      "method",
      "post",
      target.constructor.prototype,
      propertyKey
    );
    Reflect.defineMetadata(
      "path",
      path,
      target.constructor.prototype,
      propertyKey
    );
  };
}

export function Put(path: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    if (path === "/" || path === "//") path = "";

    // descriptor.value = async function (c: Context, ...args: any[]) {
    //   return errorHandler(() => originalMethod.apply(this, [c, ...args]), c);
    // };

    Reflect.defineMetadata(
      "method",
      "put",
      target.constructor.prototype,
      propertyKey
    );
    Reflect.defineMetadata(
      "path",
      path,
      target.constructor.prototype,
      propertyKey
    );
  };
}

export function Patch(path: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    if (path === "/" || path === "//") path = "";

    // descriptor.value = async function (c: Context, ...args: any[]) {
    //   return errorHandler(() => originalMethod.apply(this, [c, ...args]), c);
    // };

    Reflect.defineMetadata(
      "method",
      "patch",
      target.constructor.prototype,
      propertyKey
    );
    Reflect.defineMetadata(
      "path",
      path,
      target.constructor.prototype,
      propertyKey
    );
  };
}
export function Delete(path: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    if (path === "/" || path === "//") path = "";

    // descriptor.value = async function (c: Context, ...args: any[]) {
    //   return errorHandler(() => originalMethod.apply(this, [c, ...args]), c);
    // };

    Reflect.defineMetadata(
      "method",
      "delete",
      target.constructor.prototype,
      propertyKey
    );
    Reflect.defineMetadata(
      "path",
      path,
      target.constructor.prototype,
      propertyKey
    );
  };
}
export function Use(middleware: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const existingMiddlewares =
      Reflect.getMetadata(
        "middlewares",
        target.constructor.prototype,
        propertyKey
      ) || [];
    Reflect.defineMetadata(
      "middlewares",
      [...existingMiddlewares, middleware],
      target.constructor.prototype,
      propertyKey
    );
  };
}
