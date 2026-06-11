export interface RuntimeConfig {
  apiBaseUrl: string;
}

const DEFAULT_CONFIG: RuntimeConfig = {
  apiBaseUrl: "/api",
};

let runtimeConfig: RuntimeConfig = DEFAULT_CONFIG;
let loadPromise: Promise<RuntimeConfig> | null = null;

function normalizeApiBaseUrl(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_CONFIG.apiBaseUrl;

  const normalized = value.trim().replace(/\/+$/, "");
  return normalized || DEFAULT_CONFIG.apiBaseUrl;
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const response = await fetch("/config.json", { cache: "no-store" });
      if (!response.ok) {
        runtimeConfig = DEFAULT_CONFIG;
        return runtimeConfig;
      }

      const payload = (await response.json()) as Partial<RuntimeConfig>;
      runtimeConfig = {
        apiBaseUrl: normalizeApiBaseUrl(payload.apiBaseUrl),
      };
      return runtimeConfig;
    } catch {
      runtimeConfig = DEFAULT_CONFIG;
      return runtimeConfig;
    }
  })();

  return loadPromise;
}

export function getRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

export function getApiBaseUrl(): string {
  return getRuntimeConfig().apiBaseUrl;
}