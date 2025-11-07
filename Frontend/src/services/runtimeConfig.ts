// Minimal runtime config helper for frontend
// Provides getRuntimeConfig(key) -> Promise<any> and setRuntimeConfig(key, value)
// Caches reads to avoid repeated network calls during a session.

const cache: Record<string, any> = {};

export async function getRuntimeConfig(key: string) {
  if (!key) return null;
  if (key in cache) return cache[key];
  try {
    const res = await fetch(`/api/config/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const body = await res.json();
    // API shape is { key, value }
    const val = body?.value ?? null;
    cache[key] = val;
    return val;
  } catch (err) {
    console.warn('getRuntimeConfig error', err);
    return null;
  }
}

export async function setRuntimeConfig(key: string, value: any) {
  if (!key) return false;
  try {
    const res = await fetch(`/api/config/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) return false;
    cache[key] = value;
    return true;
  } catch (err) {
    console.warn('setRuntimeConfig error', err);
    return false;
  }
}

export function clearRuntimeConfigCache(key?: string) {
  if (!key) { Object.keys(cache).forEach(k => delete cache[k]); return; }
  delete cache[key];
}

export default { getRuntimeConfig, setRuntimeConfig, clearRuntimeConfigCache };
