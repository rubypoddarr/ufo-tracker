type AppConfig = {
  appName: string;
  dataEndpoint: string;
  runId: string;
};

// ✅ stable config
function getConfig(): AppConfig {
  return {
    appName: "ufo_tracker",
    dataEndpoint: "https://ufo-tracker-9alh.onrender.com/api", // MUST include /api
    runId: ""
  };
}

type RpcParams = {
  func: string;
  args?: Record<string, any>;
};

function getUserFacingErrorMessage(status: number): string {
  if (status === 401) return "Auth required.";
  if (status === 403) return "No access.";
  if (status === 404) return "Not found.";
  if (status >= 500) return "Server error.";
  return "Request failed.";
}

// cache key
function cacheKey(func: string, args: any): string {
  return `rpc:${func}:${JSON.stringify(args)}`;
}

function getCached<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function setCache(key: string, value: any) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// 🔥 CORE FETCH (MATCHES FLASK BACKEND)
async function fetchRpc<T>(
  config: AppConfig,
  func: string,
  args: Record<string, any>
): Promise<T> {

  const res = await fetch(config.dataEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      func,
      args
    })
  });

  const raw = await res.text();

  if (!res.ok) {
    throw new Error(getUserFacingErrorMessage(res.status));
  }

  return JSON.parse(raw);
}

// 🚀 MAIN RPC CALL
export async function rpcCall<T = any>({
  func,
  args = {}
}: RpcParams): Promise<T> {

  const config = getConfig();
  const key = cacheKey(func, args);

  const cached = getCached<T>(key);

  if (cached) {
    // background refresh
    fetchRpc<T>(config, func, args)
      .then((fresh) => setCache(key, fresh))
      .catch(() => {});
    return cached;
  }

  const data = await fetchRpc<T>(config, func, args);
  setCache(key, data);
  return data;
}
