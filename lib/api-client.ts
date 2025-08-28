import type { ApiResponse } from "./error-handler";

/*
 * API client for interacting with the backend automation services via RESTful endpoints.
 * This is used by frontend side for hitting the api routes eandpoints
 */

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  }

  // API: start automation
  async startAutomation(prompt: string) {
    return this.request("/automation/start", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  }
}

export const apiClient = new ApiClient();
