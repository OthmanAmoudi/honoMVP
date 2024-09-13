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
      throw new Error(`Service class not found in module: ${servicePath}`);
    }

    return ServiceClass;
  } catch (error) {
    console.error(`Error resolving service for ${controllerName}:`, error);
    throw new Error(`Service not found for controller: ${controllerName}`);
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

    const fullPath = path.join(basePath, routePath).replace(/\\/g, "/");
    const relativePath = routePath.startsWith("/")
      ? routePath
      : `/${routePath}`;

    try {
      const ServiceClass = resolveService(ControllerClass);
      const controllerInstance = new ControllerClass(new ServiceClass());

      const routeRouter = new Hono();

      // Apply middlewares
      if (Array.isArray(middlewares)) {
        middlewares.forEach((mw) => routeRouter.use("*", mw));
      } else if (typeof middlewares === "function") {
        routeRouter.use("*", middlewares);
      }

      // Get additional services
      const additionalServices = getAdditionalServices(
        controllerInstance
      ).filter((service) => service !== "service");

      // Set up extra routes
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
          handler: Function;
          middlewares: MiddlewareHandler[];
        }) => {
          const routeHandler = (c: Context) =>
            handler.call(controllerInstance, c);
          if (Array.isArray(routeMiddlewares) && routeMiddlewares.length > 0) {
            (routeRouter as any)[method.toLowerCase()](
              extraPath,
              ...routeMiddlewares,
              routeHandler
            );
          } else {
            (routeRouter as any)[method.toLowerCase()](extraPath, routeHandler);
          }
          bootInfo.push({
            path: path
              .join(globalPrefix, fullPath, extraPath)
              .replace(/\\/g, "/"),
            controller: ControllerClass.name,
            services: [
              ServiceClass ? ServiceClass.name : null,
              ...additionalServices,
            ].filter(Boolean),
            middlewares: [...routeMiddlewares.map((mw) => getFuncName(mw))],
            methods: [method.toUpperCase()],
          });
        }
      );

      // Standard RESTful routes
      if (standardRoutes) {
        bootInfo.push({
          path: path.join(globalPrefix, fullPath).replace(/\\/g, "/"),
          controller: ControllerClass.name,
          services: [
            ServiceClass ? ServiceClass.name : null,
            ...additionalServices,
          ].filter(Boolean),
          middlewares: [],
          methods: ["GET", "POST", "GET", "PUT", "DELETE"],
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
      router.route(relativePath, routeRouter);
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
