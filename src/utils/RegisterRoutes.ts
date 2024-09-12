//src/utils/RegisterRoutes.ts
import { Context, Hono } from "hono";
import { RouteConfig, RouteInfo } from "./";
import path from "node:path";

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
    console.warn(`Error resolving service for ${controllerName}.`);
    console.warn(`Continuing without service for ${controllerName}.`);
    return null;
  }
}
export default function setupRoutes(
  app: Hono,
  routesConfig: RouteConfig[]
): RouteInfo[] {
  const globalPrefix = routesConfig.find((route) => route.prefix)?.prefix || "";
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
          appliedMiddlewares.push(mw.name || "anonymous");
        });
      } else if (typeof middlewares === "function") {
        routeRouter.use("*", middlewares);
        appliedMiddlewares.push(middlewares.name || "anonymous");
      }

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
          handler: (c: Context) => Promise<any>;
          middlewares?: any[];
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
            service: ServiceClass ? ServiceClass.name : null,
            middlewares: [
              ...appliedMiddlewares,
              ...routeMiddlewares.map((mw) => mw.name || "anonymous"),
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
          service: ServiceClass ? ServiceClass.name : null,
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

  return bootInfo;
}
