import { Context, Hono, MiddlewareHandler } from "hono";
import { RouteConfig, RouteInfo } from "./";
import path from "node:path";
import { printBootInfo } from "./BootLogger";

// Resolves the corresponding service for a given controller
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
    console.warn(
      `Error resolving service for ${controllerName}. Continuing without service.`
    );
    return null;
  }
}

// Extract additional services from the controller instance
function getAdditionalServices(controllerInstance: any): string[] {
  return Object.entries(controllerInstance)
    .filter(
      ([key, value]) =>
        key.toLowerCase().includes("service") && typeof value === "object"
    )
    .map(([key]) => key);
}

// Returns the function name for a middleware or "middleware" if name not found
function getFuncName(func: Function | object): string {
  if (Array.isArray(func)) {
    return func.map((f) => getFuncName(f)).join(", ");
  }
  if (typeof func === "function" && func.name) return func.name;
  if (typeof func === "object" && func.constructor && func.constructor.name)
    return func.constructor.name;
  return "middleware";
}

// Set up and configure routes
function setupRoute(
  router: Hono,
  routeConfig: RouteConfig,
  globalPrefix: string,
  bootInfo: RouteInfo[],
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
  const ServiceClass = resolveService(ControllerClass);

  const controllerInstance = ServiceClass
    ? new ControllerClass(new ServiceClass())
    : new ControllerClass();

  const routeRouter = new Hono();
  const appliedMiddlewares: string[] = applyMiddlewares(
    routeRouter,
    middlewares as MiddlewareHandler | MiddlewareHandler[]
  );
  const additionalServices = getAdditionalServices(controllerInstance).filter(
    (service) => service !== "service"
  );

  setupExtraRoutes(
    routeRouter,
    controllerInstance,
    fullPath,
    globalPrefix,
    bootInfo,
    appliedMiddlewares,
    additionalServices
  );
  setupStandardRoutes(
    routeRouter,
    controllerInstance,
    standardRoutes,
    fullPath,
    globalPrefix,
    bootInfo,
    appliedMiddlewares,
    additionalServices
  );
  setupNestedRoutes(
    routeRouter,
    nestedRoutes,
    globalPrefix,
    bootInfo,
    fullPath
  );

  router.route(fullPath, routeRouter);
}

// Apply middlewares to the route router
function applyMiddlewares(
  routeRouter: Hono,
  middlewares: MiddlewareHandler | MiddlewareHandler[]
): string[] {
  const appliedMiddlewares: string[] = [];
  const mwArray = Array.isArray(middlewares) ? middlewares : [middlewares];

  mwArray.forEach((mw) => {
    routeRouter.use("*", mw);
    appliedMiddlewares.push(getFuncName(mw));
  });

  return appliedMiddlewares;
}

// Set up extra (custom) routes defined in the controller
function setupExtraRoutes(
  routeRouter: Hono,
  controllerInstance: any,
  fullPath: string,
  globalPrefix: string,
  bootInfo: RouteInfo[],
  appliedMiddlewares: string[],
  additionalServices: string[]
) {
  const extraRoutes = controllerInstance.getExtraRoutes?.() || [];
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
      const routeHandler = (c: Context) => handler.call(controllerInstance, c);

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
        controller: controllerInstance.constructor.name,
        services: additionalServices,
        middlewares: [
          ...appliedMiddlewares,
          ...routeMiddlewares.map((mw) => getFuncName(mw)),
        ],
        methods: [method.toUpperCase()],
      });
    }
  );
}

// Set up standard CRUD routes
function setupStandardRoutes(
  routeRouter: Hono,
  controllerInstance: any,
  standardRoutes: boolean,
  fullPath: string,
  globalPrefix: string,
  bootInfo: RouteInfo[],
  appliedMiddlewares: string[],
  additionalServices: string[]
) {
  if (!standardRoutes) return;

  const standardRouteMethods = ["GET", "POST", "GET", "PUT", "DELETE"];
  routeRouter.get("/", controllerInstance.getAll);
  routeRouter.post("/", controllerInstance.create);
  routeRouter.get("/:id", controllerInstance.getById);
  routeRouter.put("/:id", controllerInstance.update);
  routeRouter.delete("/:id", controllerInstance.delete);

  bootInfo.push({
    path: globalPrefix + fullPath,
    controller: controllerInstance.constructor.name,
    services: additionalServices,
    middlewares: appliedMiddlewares,
    methods: standardRouteMethods,
  });
}

// Set up nested routes
function setupNestedRoutes(
  routeRouter: Hono,
  nestedRoutes: RouteConfig[],
  globalPrefix: string,
  bootInfo: RouteInfo[],
  basePath: string
) {
  nestedRoutes.forEach((nestedRoute) => {
    setupRoute(routeRouter, nestedRoute, globalPrefix, bootInfo, basePath);
  });
}

// Main route setup function
export default function setupRoutes(
  app: Hono,
  routesConfig: RouteConfig[],
  prefix: { prefix: string }
): RouteInfo[] {
  const globalPrefix = prefix.prefix;
  const bootInfo: RouteInfo[] = [];
  const mainRouter = new Hono();

  routesConfig.forEach((config) =>
    setupRoute(mainRouter, config, globalPrefix, bootInfo)
  );
  app.route(globalPrefix, mainRouter);
  printBootInfo(bootInfo);

  return bootInfo;
}
