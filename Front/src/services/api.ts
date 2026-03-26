// API helper using fetch instead of axios
import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data.data || {};
    
    if (accessToken && newRefreshToken) {
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      return accessToken;
    }
    
    return null;
  } catch {
    return null;
  }
}

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const accessToken = useAuthStore.getState().accessToken;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  let response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 - try to refresh token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry with new token
      response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else {
      // Refresh failed - logout
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError('Session expired', 401);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return fetchWithAuth<T>(`${url}${queryString}`);
  },

  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, {
      method: 'DELETE',
    }),
};

export default api;
