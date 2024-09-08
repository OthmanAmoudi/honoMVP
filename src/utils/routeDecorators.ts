// src/utils/routeDecorator.ts

export function Route(method: string, path: string, middleware?: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!target.extraRoutes) {
      target.extraRoutes = [];
    }
    target.extraRoutes.push({
      method: method.toLowerCase(),
      path,
      handler: descriptor.value,
      name: propertyKey,
      middleware,
    });
  };
}

// Convenience decorators for common HTTP methods
export const Get = (path: string, middleware?: any) =>
  Route("get", path, middleware);
export const Post = (path: string, middleware?: any) =>
  Route("post", path, middleware);
export const Put = (path: string, middleware?: any) =>
  Route("put", path, middleware);
export const Delete = (path: string, middleware?: any) =>
  Route("delete", path, middleware);
export const Patch = (path: string, middleware?: any) =>
  Route("patch", path, middleware);
