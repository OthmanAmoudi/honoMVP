//src/utils/RegisterRoutes.ts
import { Context, Hono, MiddlewareHandler } from "hono";
import { RouteConfig, RouteInfo } from "./";
import path from "node:path";
import { printBootInfo } from "./BootLogger";

function resolveService(
  ControllerClass: new (...args: any[]) => any
): any | null {
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
        `Service class not found for ${controllerName}. Continuing without service.`
      );
      return null;
    }

    return ServiceClass;
  } catch (error) {
    // console.warn(`Error resolving service for ${controllerName}.`);
    console.warn(`Continuing without service for ${controllerName}.`);
    return null;
  }
}

function getAdditionalServices(controllerInstance: any): string[] {
  return Object.entries(controllerInstance)
    .filter(
      ([key, value]) =>
        key.toLowerCase().includes("service") && typeof value === "object"
    )
    .map(([key]) => key);
}

function getFuncName(func: Function | object): string {
  if (Array.isArray(func)) {
    return func.map((f) => getFuncName(f)).join(", ");
  }
  if (typeof func === "function" && func.name) return func.name;
  if (typeof func === "object" && func.constructor && func.constructor.name)
    return func.constructor.name;
  return "middleware";
}

export default function setupRoutes(
  app: Hono,
  routesConfig: RouteConfig[],
  prefix: { prefix: string }
): RouteInfo[] {
  const globalPrefix = prefix.prefix;
  const bootInfo: RouteInfo[] = [];

  function setupRoute(
    router: Hono,
    routeConfig: RouteConfig,
    basePath: string = ""
  ) {
    const {
      path: routePath,
      controller: ControllerClass,
      middlewares = [],
      standardRoutes = true,
      nestedRoutes = [],
    } = routeConfig;

    const fullPath = `${basePath}${routePath}`;

    try {
      const ServiceClass = resolveService(ControllerClass);
      const controllerInstance = ServiceClass
        ? new ControllerClass(new ServiceClass())
        : new ControllerClass();

      const routeRouter = new Hono();

      // Apply middlewares
      const appliedMiddlewares: string[] = [];
      if (Array.isArray(middlewares)) {
        middlewares.forEach((mw) => {
          routeRouter.use("*", mw);
          appliedMiddlewares.push(getFuncName(mw));
        });
      } else if (typeof middlewares === "function") {
        routeRouter.use("*", middlewares);
        appliedMiddlewares.push(getFuncName(middlewares));
      }

      const additionalServices = getAdditionalServices(
        controllerInstance
      ).filter((service) => service !== "service"); // Set up extra routes
      const extraRoutes = controllerInstance.getExtraRoutes();
      extraRoutes.forEach(
        ({
          method,
          path: extraPath,
          handler,
          middlewares: routeMiddlewares = [],
        }: {
          method: string;
          path: string;
          handler: (c: Context) => Promise<any>;
          middlewares?: MiddlewareHandler[];
        }) => {
          const routeHandler = (c: Context) =>
            handler.call(controllerInstance, c);
          if (Array.isArray(routeMiddlewares) && routeMiddlewares.length > 0) {
            (routeRouter as any)[method](
              extraPath,
              ...routeMiddlewares,
              routeHandler
            );
          } else {
            (routeRouter as any)[method](extraPath, routeHandler);
          }
          bootInfo.push({
            path: `${globalPrefix}${fullPath}${extraPath}`,
            controller: ControllerClass.name,
            services: [
              ServiceClass ? ServiceClass.name : null,
              ...additionalServices,
            ].filter(Boolean),
            middlewares: [
              ...appliedMiddlewares,
              ...routeMiddlewares.map((mw) => getFuncName(mw)),
            ],
            methods: [method.toUpperCase()],
          });
        }
      );

      // Standard RESTful routes
      if (standardRoutes) {
        const standardRouteMethods = ["GET", "POST", "GET", "PUT", "DELETE"];
        bootInfo.push({
          path: globalPrefix + fullPath,
          controller: ControllerClass.name,
          services: [
            ServiceClass ? ServiceClass.name : null,
            ...additionalServices,
          ].filter(Boolean),
          middlewares: appliedMiddlewares,
          methods: standardRouteMethods,
        });

        routeRouter.get("/", controllerInstance.getAll);
        routeRouter.post("/", controllerInstance.create);
        routeRouter.get("/:id", controllerInstance.getById);
        routeRouter.put("/:id", controllerInstance.update);
        routeRouter.delete("/:id", controllerInstance.delete);
      }

      // Set up nested routes
      nestedRoutes.forEach((nestedRoute) => {
        setupRoute(routeRouter, nestedRoute, fullPath);
      });

      // Mount the route router
      router.route(fullPath, routeRouter);
    } catch (error) {
      console.error(
        `Error setting up routes for ${ControllerClass.name}:`,
        error
      );
    }
  }

  const mainRouter = new Hono();
  routesConfig.forEach((config) => setupRoute(mainRouter, config));
  app.route(globalPrefix, mainRouter);
  printBootInfo(bootInfo);
  return bootInfo;
}
