import { ApiError } from "@/types/api-error";
import { useAuthStore } from "@/stores/auth-store";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function getAuthHeaders(): Record<string, string> {
  const state = useAuthStore.getState();
  const headers: Record<string, string> = {};

  if (state.mode === "bearer" && state.token) {
    headers["Authorization"] = `Bearer ${state.token}`;
  } else if (state.mode === "dev-headers" && state.actor) {
    headers["X-Firmcase-Actor"] = state.actor;
    if (state.role) {
      headers["X-Firmcase-Role"] = state.role;
    }
  }

  return headers;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(path, options.params);
  const authHeaders = getAuthHeaders();

  const init: RequestInit = {
    method,
    headers: {
      ...authHeaders,
      ...(options.body !== undefined && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  };

  if (options.body !== undefined) {
    init.body =
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body);
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    let body: { message: string; detail_code?: string };
    try {
      const raw = await response.json();
      body = {
        message: raw.message ?? raw.detail ?? response.statusText,
        detail_code: raw.detail_code,
      };
    } catch {
      body = { message: response.statusText };
    }
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) =>
    request<T>("POST", path, options),
  put: <T>(path: string, options?: RequestOptions) =>
    request<T>("PUT", path, options),
  patch: <T>(path: string, options?: RequestOptions) =>
    request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
};

export function downloadUrl(path: string): string {
  const state = useAuthStore.getState();
  const url = new URL(API_BASE + path, window.location.origin);
  if (state.mode === "bearer" && state.token) {
    url.searchParams.set("token", state.token);
  }
  return url.toString();
}
