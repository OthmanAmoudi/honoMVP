// src/types/types.ts
import { MiddlewareHandler } from "hono";

export interface RouteConfig {
  path: string;
  controller: new (service: any) => any;
  middlewares?: ((c: any, next: any) => any) | ((c: any, next: any) => any)[];
}

export type CustomRoute = {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handler: MiddlewareHandler;
  middlewares?: MiddlewareHandler[];
};
