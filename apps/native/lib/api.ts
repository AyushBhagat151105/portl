import { env } from "@portl/env/native";

class ApiClient {
  private async request(path: string, options: RequestInit = {}) {
    const url = `${env.EXPO_PUBLIC_SERVER_URL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get(path: string, options?: { params?: Record<string, string> }) {
    let url = path;
    if (options?.params) {
      const cleanParams: Record<string, string> = {};
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          cleanParams[key] = String(val);
        }
      });
      const searchParams = new URLSearchParams(cleanParams);
      url += `?${searchParams.toString()}`;
    }
    return this.request(url, { method: "GET" });
  }

  async post(path: string, body?: any) {
    return this.request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch(path: string, body?: any) {
    return this.request(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete(path: string) {
    return this.request(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
export default api;
