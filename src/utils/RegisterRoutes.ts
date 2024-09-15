// src/utils/RegisterRoutes.ts
import { Hono, Context, MiddlewareHandler } from "hono";
import path from "node:path";
import { RouteConfig, RouteInfo } from "./types";
import { printBootInfo } from "./BootLogger";

import { db } from "../db/singletonDBInstance"; // Assume this returns Promise<PostgresJsDatabase>
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { withErrorHandler } from "./Errors";

export class ServiceResolver {
  private static dbInstance: PostgresJsDatabase;

  static async initDb() {
    if (!this.dbInstance) {
      this.dbInstance = await db(); // Initialize db instance
    }
    return this.dbInstance;
  }

  static async resolveServices(ControllerClass: any): Promise<any[]> {
    const serviceClasses = ControllerClass.services || [];
    const dbInstance = await this.initDb();
    return serviceClasses.map((ServiceClass: any) => {
      return new ServiceClass(dbInstance); // Pass db instance to service constructor
    });
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
      const controllerInstance = new ControllerClass(...services);
      // Automatically assign the main service to this.service
      if (!controllerInstance.service && services.length > 0) {
        controllerInstance.service = services[0];
      }
      const routeRouter = new Hono();

      this.applyMiddlewares(routeRouter, middlewares);
      // const additionalServices = this.getAdditionalServices(controllerInstance);

      // Ensure these methods are async and awaited
      await this.setupExtraRoutes(
        routeRouter,
        controllerInstance,
        fullPath,
        ControllerClass,
        services.map((s) => s.constructor.name)
        // additionalServices
      );

      if (standardRoutes) {
        await this.setupStandardRoutes(
          routeRouter,
          controllerInstance,
          fullPath,
          ControllerClass,
          services.map((s) => s.constructor.name)
          // additionalServices
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

  // private getAdditionalServices(controllerInstance: any): string[] {
  //   return Object.entries(controllerInstance)
  //     .filter(
  //       ([key, value]) =>
  //         key.toLowerCase().includes("service") && typeof value === "object"
  //     )
  //     .map(([key]) => key);
  // }

  private async setupExtraRoutes(
    routeRouter: Hono,
    controllerInstance: any,
    fullPath: string,
    ControllerClass: new (...args: any[]) => any,
    ServiceClass: any
    // additionalServices: string[]
  ) {
    const extraRoutes = controllerInstance.getExtraRoutes();
    extraRoutes.forEach(
      ({
        method,
        path: extraPath,
        handler,
        handlerName,
        middlewares: routeMiddlewares = [],
        serviceNames = [],
      }: {
        method: string;
        path: string;
        handler: Function;
        handlerName: string;
        middlewares: MiddlewareHandler[];
        serviceNames: string[];
      }) => {
        const routeHandler = (c: Context) =>
          handler.call(controllerInstance, c);
        const routePath = extraPath;

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
          path: path
            .join(this.globalPrefix, fullPath, routePath)
            .replace(/\\/g, "/"),
          controller: ControllerClass.name,
          services: [...serviceNames].filter(Boolean),
          middlewares: routeMiddlewares.map((mw) => this.getFuncName(mw)),
          methods: [method.toUpperCase()],
          handler: handlerName,
        });
      }
    );
  }

  private async setupStandardRoutes(
    routeRouter: Hono,
    controllerInstance: any,
    fullPath: string,
    ControllerClass: new (...args: any[]) => any,
    serviceNames: string[]
  ): Promise<void> {
    const proto = Object.getPrototypeOf(controllerInstance);

    const standardRoutesInfo = [
      { defaultPath: "", defaultMethod: "GET", handlerName: "getAll" },
      { defaultPath: "", defaultMethod: "POST", handlerName: "create" },
      { defaultPath: "/:id", defaultMethod: "GET", handlerName: "getById" },
      { defaultPath: "/:id", defaultMethod: "PUT", handlerName: "update" },
      { defaultPath: "/:id", defaultMethod: "DELETE", handlerName: "delete" },
    ];

    standardRoutesInfo.forEach(
      ({ defaultPath, defaultMethod, handlerName }) => {
        const handler = controllerInstance[handlerName];
        if (typeof handler === "function") {
          const methodMetadata =
            Reflect.getMetadata("method", proto, handlerName) || defaultMethod;
          const pathMetadata =
            Reflect.getMetadata("path", proto, handlerName) || defaultPath;
          const middlewares =
            Reflect.getMetadata("middlewares", proto, handlerName) || [];

          // Bind the handler if necessary
          const routeHandler = handler.bind(controllerInstance);

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
            services: [...serviceNames].filter(Boolean),
            middlewares: middlewares.map((mw: any) => this.getFuncName(mw)),
            methods: [methodMetadata.toUpperCase()],
            handler: handlerName, // Use handlerName instead of handler.name
          });
        }
      }
    );
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

    for (const config of this.routesConfig) {
      await routeHandler.setupRoute(config); // Await each route setup
    }

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
    console.error("Error occurred:");
    withErrorHandler(err, c);
    return c.json({ error: "An unexpected error occurred" }, 500);
  });
  return await registrar.register();
}
