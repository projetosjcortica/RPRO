// Simple runtime configuration store used by backend services
const store: Record<string, any> = {};

function tryParseMaybeJson(v: any) {
  if (typeof v !== 'string') return v;
  const s = v.trim();
  if (!s) return v;
  // Heuristic: if starts with { or [ try to parse
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      return JSON.parse(s);
    } catch (e) {
      // fallthrough: return original string
      return v;
    }
  }
  return v;
}

export function getRuntimeConfig(key: string): any {
  const v = store[key];
  return tryParseMaybeJson(v);
}

export function setRuntimeConfig(key: string, value: any): void {
  // If value is a stringified JSON, parse it so consumers get objects
  store[key] = tryParseMaybeJson(value);
}

export function setRuntimeConfigs(obj: Record<string, any>): void {
  if (!obj) return;
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    store[k] = tryParseMaybeJson(v);
  });
}

export function getAllRuntimeConfigs(): Record<string, any> {
  // Return parsed copies
  const out: Record<string, any> = {};
  Object.keys(store).forEach((k) => {
    out[k] = tryParseMaybeJson(store[k]);
  });
  return out;
}

export default {
  get: getRuntimeConfig,
  set: setRuntimeConfig,
  setMany: setRuntimeConfigs,
  all: getAllRuntimeConfigs,
};
