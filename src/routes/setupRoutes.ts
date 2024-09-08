import { Context, Hono } from "hono";
import { RouteConfig } from "../types/types";
import path from "path";

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

// export default function setupRoutes(app: Hono, routesConfig: RouteConfig[]) {
//   routesConfig.forEach(
//     ({ path, controller: ControllerClass, middlewares = [] }) => {
//       const router = new Hono();

//       // Apply middlewares
//       middlewares.forEach((mw) => router.use(mw));

//       try {
//         // Resolve the service
//         const ServiceClass = resolveService(ControllerClass);

//         // Initialize the controller with the corresponding service
//         const controllerInstance = new ControllerClass(new ServiceClass());

//         // Set up extra routes
//         const extraRoutes = controllerInstance.getExtraRoutes();
//         extraRoutes.forEach(
//           ({
//             method,
//             path: routePath,
//             handler,
//           }: {
//             method: string;
//             path: string;
//             handler: (c: Context) => Promise<any>;
//           }) => {
//             (router as any)[method](routePath, handler);
//           }
//         );

//         // Standard RESTful routes
//         router.get("/", controllerInstance.getAll);
//         router.get("/:id", controllerInstance.getById);
//         router.post("/", controllerInstance.create);
//         router.put("/:id", controllerInstance.update);
//         router.delete("/:id", controllerInstance.delete);

//         app.route(path, router);
//       } catch (error) {
//         console.error(
//           `Error setting up routes for ${ControllerClass.name}:`,
//           error
//         );
//       }
//     }
//   );
// }
export default function setupRoutes(app: Hono, routesConfig: RouteConfig[]) {
  routesConfig.forEach(
    ({ path, controller: ControllerClass, middlewares = [] }) => {
      const router = new Hono();

      // Apply middlewares
      if (typeof middlewares === "object") {
        middlewares.forEach((mw) => router.use(mw));
      } else {
        router.use(middlewares);
      }

      try {
        // Resolve the service
        const ServiceClass = resolveService(ControllerClass);

        // Initialize the controller with the corresponding service
        const controllerInstance = new ControllerClass(new ServiceClass());

        // Set up extra routes
        const extraRoutes = controllerInstance.getExtraRoutes();
        extraRoutes.forEach(
          ({
            method,
            path: routePath,
            handler,
            middleware,
          }: {
            method: string;
            path: string;
            handler: (c: Context) => Promise<any>;
            middleware?: any;
          }) => {
            (router as any)[method](routePath, (c: any) =>
              // TODO: add middleware
              handler.call(controllerInstance, c)
            );
          }
        );
        // Standard RESTful routes
        router.get("/", controllerInstance.getAll);
        router.get("/:id", controllerInstance.getById);
        router.post("/", controllerInstance.create);
        router.put("/:id", controllerInstance.update);
        router.delete("/:id", controllerInstance.delete);

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
