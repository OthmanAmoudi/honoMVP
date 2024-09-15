// src/utils/RegisterRoutes.ts
import { Hono, Context, MiddlewareHandler } from "hono";
import path from "node:path";
import { RouteConfig, RouteInfo, Controller, ExtraRoute } from "./types";
import { printBootInfo } from "./BootLogger";
import { db } from "../db/singletonDBInstance";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import "reflect-metadata";
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

  constructor(router: Hono, bootInfo: RouteInfo[], globalPrefix: string) {
    this.router = router;
    this.bootInfo = bootInfo;
    this.globalPrefix = globalPrefix;
  }

  private joinPaths(...paths: string[]): string {
    return paths
      .map((p) => p.replace(/^\/+|\/+$/g, "")) // Remove leading and trailing slashes
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
      // Resolve all required services
      const services = await ServiceResolver.resolveServices(ControllerClass);

      // Instantiate the controller with all services
      const controllerInstance: Controller = new ControllerClass(...services);

      // Automatically assign the main service to this.service if not set
      if (!controllerInstance.service && services.length > 0) {
        controllerInstance.service = services[0];
      }

      const routeRouter = new Hono();

      this.applyMiddlewares(routeRouter, middlewares);

      // Ensure these methods are async and awaited
      await this.setupExtraRoutes(
        routeRouter,
        controllerInstance,
        fullPath,
        ControllerClass,
        services.map((s) => s.constructor.name)
      );

      if (standardRoutes) {
        await this.setupStandardRoutes(
          routeRouter,
          controllerInstance,
          fullPath,
          ControllerClass,
          services.map((s) => s.constructor.name)
        );
      }

      // Process nested routes and await their setup
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

  private async setupExtraRoutes(
    routeRouter: Hono,
    controllerInstance: Controller,
    fullPath: string,
    ControllerClass: new (...args: any[]) => Controller,
    serviceNames: string[]
  ) {
    const extraRoutes: ExtraRoute[] =
      typeof controllerInstance.getExtraRoutes === "function"
        ? controllerInstance.getExtraRoutes()
        : [];

    extraRoutes.forEach((route) => {
      const {
        method,
        path: extraPath,
        handler,
        handlerName,
        middlewares: routeMiddlewares = [],
        serviceNames: routeServiceNames = [],
      } = route;

      const routeHandler = async (c: Context) => {
        return await handler.call(controllerInstance, c);
      };

      if (routeMiddlewares.length > 0) {
        (routeRouter as any)[method.toLowerCase()](
          extraPath,
          ...routeMiddlewares,
          routeHandler
        );
      } else {
        (routeRouter as any)[method.toLowerCase()](extraPath, routeHandler);
      }

      this.bootInfo.push({
        path: path
          .join(this.globalPrefix, fullPath, extraPath)
          .replace(/\\/g, "/"),
        controller: ControllerClass.name,
        services: [...serviceNames, ...routeServiceNames].filter(Boolean),
        middlewares: routeMiddlewares.map((mw) => this.getFuncName(mw)),
        methods: [method.toUpperCase()],
        handler: handlerName,
      });
    });
  }

  private async setupStandardRoutes(
    routeRouter: Hono,
    controllerInstance: Controller,
    fullPath: string,
    ControllerClass: new (...args: any[]) => Controller,
    serviceNames: string[]
  ): Promise<void> {
    const standardRoutesInfo = [
      { defaultPath: "", defaultMethod: "GET", handlerName: "getAll" },
      { defaultPath: "", defaultMethod: "POST", handlerName: "create" },
      { defaultPath: "/:id", defaultMethod: "GET", handlerName: "getById" },
      { defaultPath: "/:id", defaultMethod: "PUT", handlerName: "update" },
      { defaultPath: "/:id", defaultMethod: "DELETE", handlerName: "delete" },
    ];

    for (const {
      defaultPath,
      defaultMethod,
      handlerName,
    } of standardRoutesInfo) {
      const handler = (controllerInstance as any)[handlerName] as Function;
      if (typeof handler === "function") {
        const methodMetadata =
          Reflect.getMetadata("method", controllerInstance, handlerName) ||
          defaultMethod;
        const pathMetadata =
          Reflect.getMetadata("path", controllerInstance, handlerName) ||
          defaultPath;
        const middlewares =
          Reflect.getMetadata("middlewares", controllerInstance, handlerName) ||
          [];

        const routeHandler = async (c: Context) => {
          return await handler.call(controllerInstance, c);
        };

        if (middlewares.length > 0) {
          (routeRouter as any)[methodMetadata.toLowerCase()](
            pathMetadata,
            ...middlewares,
            routeHandler
          );
        } else {
          (routeRouter as any)[methodMetadata.toLowerCase()](
            pathMetadata,
            routeHandler
          );
        }

        this.bootInfo.push({
          path: path
            .join(this.globalPrefix, fullPath, pathMetadata)
            .replace(/\\/g, "/"),
          controller: ControllerClass.name,
          services: serviceNames.filter(Boolean),
          middlewares: middlewares.map((mw: any) => this.getFuncName(mw)),
          methods: [methodMetadata.toUpperCase()],
          handler: handlerName,
        });
      }
    }
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
