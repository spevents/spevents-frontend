//  src/services/api.ts
import { User } from "firebase/auth";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://spevents-backend-cdjd37835-fbablus-projects.vercel.app";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async makeAuthenticatedRequest<T>(
    user: User,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await user.getIdToken();

      return this.makeRequest<T>(endpoint, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return { error: "Authentication failed" };
    }
  }

  async createEvent(
    user: User,
    eventData: { name: string; description: string }
  ) {
    return this.makeAuthenticatedRequest(user, "/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async getUserEvents(user: User) {
    return this.makeAuthenticatedRequest(user, "/api/events");
  }

  async getEventBySessionCode(sessionCode: string) {
    return this.makeRequest(`/api/events?sessionCode=${sessionCode}`);
  }
}

export const apiService = new ApiService();
