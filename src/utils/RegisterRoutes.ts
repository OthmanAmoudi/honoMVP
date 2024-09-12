import { Context, Hono } from "hono";
import { RouteConfig } from "./";
import path from "node:path";

function resolveService(ControllerClass: new (...args: any[]) => any): any {
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
export default function setupRoutes(app: Hono, routesConfig: RouteConfig[]) {
  const globalPrefix = routesConfig.find((route) => route.prefix)?.prefix || "";

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
      const controllerInstance = new ControllerClass(new ServiceClass());

      const routeRouter = new Hono();

      // Apply middlewares
      if (Array.isArray(middlewares)) {
        middlewares.forEach((mw) => routeRouter.use("*", mw));
      } else if (typeof middlewares === "function") {
        routeRouter.use("*", middlewares);
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
        }
      );

      // Standard RESTful routes
      if (standardRoutes) {
        routeRouter.get("/", controllerInstance.getAll);
        routeRouter.post("/", controllerInstance.create);

        // Set up nested routes before the /:id route
        nestedRoutes.forEach((nestedRoute) => {
          setupRoute(routeRouter, nestedRoute);
        });

        // Add /:id routes after nested routes
        routeRouter.get("/:id", controllerInstance.getById);
        routeRouter.put("/:id", controllerInstance.update);
        routeRouter.delete("/:id", controllerInstance.delete);
      } else {
        // If standardRoutes is false, set up nested routes at the end
        nestedRoutes.forEach((nestedRoute) => {
          setupRoute(routeRouter, nestedRoute);
        });
      }

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
}
