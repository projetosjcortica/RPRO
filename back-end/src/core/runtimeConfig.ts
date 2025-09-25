// Simple runtime configuration store used by backend services
const store: Record<string, any> = {};

export function getRuntimeConfig(key: string): any {
  return store[key];
}

export function setRuntimeConfig(key: string, value: any): void {
  store[key] = value;
}

export function setRuntimeConfigs(obj: Record<string, any>): void {
  if (!obj) return;
  Object.keys(obj).forEach(k => { store[k] = obj[k]; });
}

export function getAllRuntimeConfigs(): Record<string, any> {
  return { ...store };
}

export default {
  get: getRuntimeConfig,
  set: setRuntimeConfig,
  setMany: setRuntimeConfigs,
  all: getAllRuntimeConfigs,
};
