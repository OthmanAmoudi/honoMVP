import { Context, Hono } from "hono";
import { RouteConfig } from "./Types";
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
  routesConfig.forEach(
    ({
      path,
      controller: ControllerClass,
      middlewares = [],
      standardRoutes = true,
    }) => {
      const router = new Hono();

      // Apply global middlewares
      if (Array.isArray(middlewares)) {
        middlewares.forEach((mw) => router.use(mw));
      } else if (typeof middlewares === "function") {
        router.use(middlewares);
      }

      try {
        const ServiceClass = resolveService(ControllerClass);
        const controllerInstance = new ControllerClass(new ServiceClass());

        // Set up extra routes
        const extraRoutes = controllerInstance.getExtraRoutes();
        extraRoutes.forEach(
          ({
            method,
            path: routePath,
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
            if (
              Array.isArray(routeMiddlewares) &&
              routeMiddlewares.length > 0
            ) {
              (router as any)[method](
                routePath,
                ...routeMiddlewares,
                routeHandler
              );
            } else {
              (router as any)[method](routePath, routeHandler);
            }
          }
        );

        // Standard RESTful routes
        if (standardRoutes) {
          router.get("/", controllerInstance.getAll);
          router.get("/:id", controllerInstance.getById);
          router.post("/", controllerInstance.create);
          router.put("/:id", controllerInstance.update);
          router.delete("/:id", controllerInstance.delete);
        }

        app.route(path, router);
      } catch (error) {
        console.error(
          `Error setting up routes for ${ControllerClass.name}:`,
          error
        );
      }
    }
  );
}
