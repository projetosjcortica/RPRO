import React, { createContext, useContext, useEffect, useState } from 'react';

type RuntimeConfigShape = {
  all: Record<string, any>;
  get: (key: string) => any;
  loading: boolean;
  reload: () => Promise<void>;
};

const RuntimeConfigContext = createContext<RuntimeConfigShape | null>(null);

async function fetchAllConfigs(): Promise<Record<string, any>> {
  const res = await fetch('http://localhost:3000/api/config');
  if (!res.ok) throw new Error('Failed to fetch runtime configs');
  const json = await res.json();
  // backend returns a map of key->string. Try to JSON.parse values when possible
  const parsed: Record<string, any> = {};
  Object.keys(json || {}).forEach((k) => {
    const v = json[k];
    if (typeof v !== 'string') {
      parsed[k] = v;
      return;
    }

    // Try JSON parse first
    let out: any = v;
    try {
      out = JSON.parse(v);
    } catch {
      // If parsing failed, handle common malformed encodings.
      // Some saved values may be objects where numeric keys map to string chars,
      // e.g. {"0":"{","1":"}","ip":"192.168.5.222"}
      try {
        const temp = JSON.parse(v.replace(/\"/g, '"'));
        out = temp;
      } catch {
        // attempt to detect numeric-indexed char maps and rebuild strings
        try {
          const maybeObj = JSON.parse(v);
          out = maybeObj;
        } catch {
          // fallback: try to parse as object with numeric keys (already string),
          // reconstruct if pattern matches: keys are '0','1',... and some other named keys
          try {
            const candidate = eval('(' + v + ')'); // last-resort; v is from server
            out = candidate;
          } catch {
            out = v;
          }
        }
      }
    }

    // If out is an object that looks like a numeric-to-char map, reconstruct
    if (out && typeof out === 'object' && !Array.isArray(out)) {
      const numericKeys = Object.keys(out).filter((x) => /^\d+$/.test(x));
      // Only reconstruct when ALL keys are numeric-indexed (this indicates a char map)
      if (numericKeys.length > 0 && numericKeys.length === Object.keys(out).length) {
        // reconstruct a string from numeric keys in order
        const chars: string[] = [];
        numericKeys
          .map((n) => Number(n))
          .sort((a, b) => a - b)
          .forEach((i) => {
            const val = out[String(i)];
            if (typeof val === 'string') chars.push(val);
          });
        const joined = chars.join('');
        // try parse joined as json
        try {
          parsed[k] = JSON.parse(joined);
          return;
        } catch {
          parsed[k] = joined;
          return;
        }
      }
    }

    // Heuristic: if out is a string that embeds an ip field like '"ip":"1.2.3.4"', extract it
    if (typeof out === 'string') {
      const ipMatch = out.match(/"ip"\s*[:]\s*"([0-9]{1,3}(?:\.[0-9]{1,3}){3})"/);
      if (ipMatch) {
        // prefer returning an object with ip and raw for easier consumption
        parsed[k] = { ip: ipMatch[1], raw: out };
        return;
      }
    }

    parsed[k] = out;
  });
  return parsed;
}

export const RuntimeConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [all, setAll] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const cfg = await fetchAllConfigs();
      setAll(cfg);
    } catch (e) {
      console.warn('Could not load runtime configs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const value: RuntimeConfigShape = {
    all,
    get: (key: string) => all[key],
    loading,
    reload: load,
  };

  return <RuntimeConfigContext.Provider value={value}>{children}</RuntimeConfigContext.Provider>;
};

export function useRuntimeConfig() {
  const ctx = useContext(RuntimeConfigContext);
  if (!ctx) throw new Error('useRuntimeConfig must be used within RuntimeConfigProvider');
  return ctx;
}

export default RuntimeConfigProvider;
