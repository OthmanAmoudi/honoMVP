// src/utils/RegisterRoutes.ts
import "reflect-metadata";
import { Hono, Context, MiddlewareHandler } from "hono";
import path from "node:path";
import { RouteConfig, RouteInfo, Controller, ExtraRoute } from "./types";
import { printBootInfo } from "./BootLogger";
import { db } from "../db/singletonDBInstance";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { withErrorHandler } from "./errors";

// Add this interface
interface ControllerConstructor {
  new (...args: any[]): Controller;
  services?: (new (db: PostgresJsDatabase) => any)[];
}

class ServiceResolver {
  static async resolveServices(
    ControllerClass: ControllerConstructor
  ): Promise<any[]> {
    const serviceClasses = ControllerClass.services || [];
    const dbInstance = await db();
    return serviceClasses.map((ServiceClass) => new ServiceClass(dbInstance));
  }
}

class RouteHandler {
  private router: Hono;
  private bootInfo: RouteInfo[];
  private globalPrefix: string;
  private registeredRoutes: Set<string>;

  constructor(router: Hono, bootInfo: RouteInfo[], globalPrefix: string) {
    this.router = router;
    this.bootInfo = bootInfo;
    this.globalPrefix = globalPrefix;
    this.registeredRoutes = new Set();
  }

  private joinPaths(...paths: string[]): string {
    return paths
      .map((p) => p.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/");
  }

  async setupRoute(routeConfig: RouteConfig, basePath: string = "") {
    const {
      path: routePath,
      controller: ControllerClass,
      middlewares = [],
      standardRoutes = true,
      nestedRoutes = [],
    } = routeConfig;

    const fullPath = this.joinPaths(basePath, routePath);
    const relativePath = "/" + fullPath;

    try {
      const services = await ServiceResolver.resolveServices(ControllerClass);
      const controllerInstance: Controller = new ControllerClass(...services);

      if (!controllerInstance.service && services.length > 0) {
        controllerInstance.service = services[0];
      }

      const routeRouter = new Hono();
      this.applyMiddlewares(routeRouter, middlewares);

      await this.setupControllerRoutes(
        routeRouter,
        controllerInstance,
        fullPath,
        ControllerClass,
        services.map((s) => s.constructor.name),
        standardRoutes
      );

      for (const nestedRoute of nestedRoutes) {
        await this.setupRoute(nestedRoute, fullPath);
      }

      this.router.route(relativePath, routeRouter);
    } catch (error) {
      console.error(
        `Error setting up routes for ${ControllerClass.name}:`,
        error
      );
    }
  }

  private applyMiddlewares(
    router: Hono,
    middlewares: MiddlewareHandler | MiddlewareHandler[]
  ) {
    if (Array.isArray(middlewares)) {
      middlewares.forEach((mw) => router.use("*", mw));
    } else if (typeof middlewares === "function") {
      router.use("*", middlewares);
    }
  }
  private async setupControllerRoutes(
    routeRouter: Hono,
    controllerInstance: Controller,
    fullPath: string,
    ControllerClass: new (...args: any[]) => Controller,
    serviceNames: string[],
    setupStandardRoutes: boolean
  ) {
    const extraRoutes: ExtraRoute[] =
      typeof controllerInstance.getExtraRoutes === "function"
        ? controllerInstance.getExtraRoutes()
        : [];

    const allRoutes = [
      ...extraRoutes,
      ...(setupStandardRoutes
        ? this.getStandardRoutes(controllerInstance)
        : []),
    ];

    for (const route of allRoutes) {
      const {
        method,
        path: routePath,
        handler,
        handlerName,
        middlewares: routeMiddlewares = [],
      } = route;

      const fullRoutePath = this.joinPaths(
        this.globalPrefix,
        fullPath,
        routePath
      );
      const routeKey = `${method.toUpperCase()}:${fullRoutePath}`;

      if (!this.registeredRoutes.has(routeKey)) {
        this.registeredRoutes.add(routeKey);

        const routeHandler = async (c: Context) => {
          return await handler.call(controllerInstance, c);
        };

        if (routeMiddlewares.length > 0) {
          (routeRouter as any)[method.toLowerCase()](
            routePath,
            ...routeMiddlewares,
            routeHandler
          );
        } else {
          (routeRouter as any)[method.toLowerCase()](routePath, routeHandler);
        }

        this.bootInfo.push({
          path: fullRoutePath,
          controller: ControllerClass.name,
          services: serviceNames,
          middlewares: routeMiddlewares.map((mw) => this.getFuncName(mw)),
          methods: [method.toUpperCase()],
          handler: handlerName,
        });
      }
    }
  }

  private getStandardRoutes(controllerInstance: Controller): ExtraRoute[] {
    const standardRoutes = [
      { path: "", method: "GET", handlerName: "getAll" },
      { path: "", method: "POST", handlerName: "create" },
      { path: "/:id", method: "GET", handlerName: "getById" },
      { path: "/:id", method: "PUT", handlerName: "update" },
      { path: "/:id", method: "DELETE", handlerName: "delete" },
    ];

    return standardRoutes
      .filter(
        ({ handlerName }) =>
          typeof (controllerInstance as any)[handlerName] === "function"
      )
      .map(({ path, method, handlerName }) => ({
        method:
          Reflect.getMetadata("method", controllerInstance, handlerName) ||
          method,
        path:
          Reflect.getMetadata("path", controllerInstance, handlerName) || path,
        handler: (controllerInstance as any)[handlerName],
        handlerName,
        middlewares:
          Reflect.getMetadata("middlewares", controllerInstance, handlerName) ||
          [],
      }));
  }

  private getFuncName(func: Function | object): string {
    if (Array.isArray(func)) {
      return func.map((f) => this.getFuncName(f)).join(", ");
    }
    if (typeof func === "function" && func.name) return func.name;
    if (typeof func === "object" && func.constructor && func.constructor.name)
      return func.constructor.name;
    return "middleware";
  }
}

export class RouteRegistrar {
  private app: Hono;
  private routesConfig: RouteConfig[];
  private globalPrefix: string;

  constructor(
    app: Hono,
    routesConfig: RouteConfig[],
    prefix: { prefix: string }
  ) {
    this.app = app;
    this.routesConfig = routesConfig;
    this.globalPrefix = prefix.prefix;
  }

  async register(): Promise<RouteInfo[]> {
    const bootInfo: RouteInfo[] = [];
    const mainRouter = new Hono();
    const routeHandler = new RouteHandler(
      mainRouter,
      bootInfo,
      this.globalPrefix
    );

    // Process routes in parallel
    await Promise.all(
      this.routesConfig.map((config) => routeHandler.setupRoute(config))
    );

    this.app.route(this.globalPrefix, mainRouter);
    printBootInfo(bootInfo);
    return bootInfo;
  }
}

export async function setupRoutes(
  app: Hono,
  routesConfig: RouteConfig[],
  prefix: { prefix: string }
): Promise<RouteInfo[]> {
  const registrar = new RouteRegistrar(app, routesConfig, prefix);
  app.onError((err, c) => {
    console.error("Error occurred:", err);
    return withErrorHandler(err, c);
  });
  return await registrar.register();
}
