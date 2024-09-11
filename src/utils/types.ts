// src/types/types.ts
import { MiddlewareHandler, Context, Next } from "hono";

export type MiddlewareFunction = (
  c: Context,
  next: Next
) => Promise<void> | void;

export interface RouteConfig {
  path: string;
  controller: new (service: any) => any;
  middlewares?: ((c: any, next: any) => any) | ((c: any, next: any) => any)[];
  standardRoutes?: boolean;
}

export type CustomRoute = {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handler: MiddlewareHandler;
  middlewares?: MiddlewareHandler[];
};

export type ServiceMethod<T> = (...args: any[]) => Promise<T>;
