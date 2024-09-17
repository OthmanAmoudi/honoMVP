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
export interface Controller {
  service?: any;
  getExtraRoutes?(): ExtraRoute[];
  // Define other standard methods if necessary
  getAll?(c: Context): Promise<any>;
  create?(c: Context): Promise<any>;
  getById?(c: Context): Promise<any>;
  update?(c: Context): Promise<any>;
  delete?(c: Context): Promise<any>;
}

export interface ExtraRoute {
  method: string;
  path: string;
  handler: (c: Context) => Promise<any>;
  handlerName: string;
  middlewares?: MiddlewareHandler[];
  serviceNames?: string[];
}
