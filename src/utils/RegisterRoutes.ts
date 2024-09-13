// src/utils/RegisterRoutes.ts
import { Hono, Context, MiddlewareHandler } from "hono";
import path from "node:path";
import { RouteConfig, RouteInfo } from "./types";
import { printBootInfo } from "./BootLogger";

class ServiceResolver {
  static resolve(ControllerClass: new (...args: any[]) => any): any | null {
    const controllerName = ControllerClass.name;
    const moduleName = controllerName.replace("Controller", "");
    const serviceName = `${moduleName}Service`;

    try {
      const servicePath = path.resolve(
        __dirname,
        "..",
        "modules",
        moduleName,
        `${serviceName}.ts`
      );
      const ServiceModule = require(servicePath);
      const ServiceClass = ServiceModule.default || ServiceModule[serviceName];

      if (!ServiceClass) {
        console.warn(
          `Service class not found in module: ${servicePath}. Controller will be instantiated without a service.`
        );
        return null;
      }

      return ServiceClass;
    } catch (error) {
      // console.warn(`Error resolving service for ${controllerName}:`, error);
      console.warn(
        `Controller ${controllerName} will be instantiated without a service.`
      );
      return null;
    }
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

  // Add this utility function to handle path joining without leading/trailing slashes
  private joinPaths(...paths: string[]): string {
    return paths
      .map((p) => p.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/");
  }

  setupRoute(routeConfig: RouteConfig, basePath: string = "") {
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
      const ServiceClass = ServiceResolver.resolve(ControllerClass);
      let controllerInstance;
      if (ServiceClass) {
        controllerInstance = new ControllerClass(new ServiceClass());
      } else {
        controllerInstance = new ControllerClass();
      }

      const routeRouter = new Hono();

      this.applyMiddlewares(routeRouter, middlewares);
      const additionalServices = this.getAdditionalServices(controllerInstance);

      this.setupExtraRoutes(
        routeRouter,
        controllerInstance,
        fullPath,
        ControllerClass,
        ServiceClass,
        additionalServices
      );

      if (standardRoutes) {
        this.setupStandardRoutes(
          routeRouter,
          controllerInstance,
          fullPath,
          ControllerClass,
          ServiceClass,
          additionalServices
        );
      }

      nestedRoutes.forEach((nestedRoute) => {
        this.setupRoute(nestedRoute, fullPath);
      });

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

  private getAdditionalServices(controllerInstance: any): string[] {
    return Object.entries(controllerInstance)
      .filter(
        ([key, value]) =>
          key.toLowerCase().includes("service") && typeof value === "object"
      )
      .map(([key]) => key);
  }

  private setupExtraRoutes(
    routeRouter: Hono,
    controllerInstance: any,
    fullPath: string,
    ControllerClass: new (...args: any[]) => any,
    ServiceClass: any,
    additionalServices: string[]
  ) {
    const extraRoutes = controllerInstance.getExtraRoutes();
    extraRoutes.forEach(
      ({
        method,
        path: extraPath,
        handler,
        handlerName,
        middlewares: routeMiddlewares = [],
      }: {
        method: string;
        path: string;
        handler: Function;
        handlerName: string;
        middlewares: MiddlewareHandler[];
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
          services: [
            ServiceClass ? ServiceClass.name : null,
            ...additionalServices,
          ].filter(Boolean),
          middlewares: routeMiddlewares.map((mw) => this.getFuncName(mw)),
          methods: [method.toUpperCase()],
          handler: handlerName,
        });
      }
    );
  }

  private setupStandardRoutes(
    routeRouter: Hono,
    controllerInstance: any,
    fullPath: string,
    ControllerClass: new (...args: any[]) => any,
    ServiceClass: any,
    additionalServices: string[]
  ) {
    const standardRoutesInfo = [
      { path: "/", method: "GET", handlerName: "getAll" },
      { path: "/", method: "POST", handlerName: "create" },
      { path: "/:id", method: "GET", handlerName: "getById" },
      { path: "/:id", method: "PUT", handlerName: "update" },
      { path: "/:id", method: "DELETE", handlerName: "delete" },
    ];

    standardRoutesInfo.forEach(({ path: routePath, method, handlerName }) => {
      const handler = controllerInstance[handlerName];
      if (typeof handler === "function") {
        (routeRouter as any)[method.toLowerCase()](routePath, handler);
        this.bootInfo.push({
          path: path
            .join(this.globalPrefix, fullPath, routePath)
            .replace(/\\/g, "/"),
          controller: ControllerClass.name,
          services: [
            ServiceClass ? ServiceClass.name : null,
            ...additionalServices,
          ].filter(Boolean),
          middlewares: [],
          methods: [method],
          handler: handler.name,
        });
      }
    });
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

  register(): RouteInfo[] {
    const bootInfo: RouteInfo[] = [];
    const mainRouter = new Hono();
    const routeHandler = new RouteHandler(
      mainRouter,
      bootInfo,
      this.globalPrefix
    );

    this.routesConfig.forEach((config) => routeHandler.setupRoute(config));

    this.app.route(this.globalPrefix, mainRouter);
    printBootInfo(bootInfo);
    return bootInfo;
  }
}

export function setupRoutes(
  app: Hono,
  routesConfig: RouteConfig[],
  prefix: { prefix: string }
): RouteInfo[] {
  const registrar = new RouteRegistrar(app, routesConfig, prefix);
  return registrar.register();
}
