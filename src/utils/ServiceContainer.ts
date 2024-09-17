// src/utils/ServiceContainer.ts
const serviceInstances = new Map<any, any>();

export function getService<T>(ServiceClass: new (...args: any[]) => T): T {
  if (!serviceInstances.has(ServiceClass)) {
    serviceInstances.set(ServiceClass, new ServiceClass());
  }
  return serviceInstances.get(ServiceClass);
}
