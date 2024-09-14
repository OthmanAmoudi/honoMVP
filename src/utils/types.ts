// src/types/types.ts
import { MiddlewareHandler, Context, Next } from "hono";

export type MiddlewareFunction = (
  c: Context,
  next: Next
) => Promise<void> | void;

export interface RouteConfig {
  path: string;
  controller: any;
  middlewares?: ((c: any, next: any) => any) | ((c: any, next: any) => any)[];
  standardRoutes?: boolean;
  // prefix?: string;
  nestedRoutes?: RouteConfig[];
}
export type CustomRoute = {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handler: MiddlewareHandler;
  middlewares?: MiddlewareHandler[];
};

export type ServiceMethod<T> = (...args: any[]) => Promise<T>;

export interface RouteInfo {
  path: string;
  controller: string;
  services: string[];
  middlewares: string[];
  methods: string[];
  handler: string;
}
