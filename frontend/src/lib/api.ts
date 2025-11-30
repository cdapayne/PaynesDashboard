const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ success: boolean; data: { user: { id: string; email: string; name: string }; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    fetchApi<{ success: boolean; data: { user: { id: string; email: string; name: string }; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  logout: (token: string) =>
    fetchApi<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
      token,
    }),

  getMe: (token: string) =>
    fetchApi<{ success: boolean; data: { id: string; email: string; name: string } }>('/auth/me', {
      token,
    }),

  // Preferences
  getPreferences: (token: string) =>
    fetchApi<{ success: boolean; data: { userId: string; theme: string; dashboardLayout: unknown[]; notifications: boolean } }>('/preferences', {
      token,
    }),

  updatePreferences: (token: string, updates: { theme?: string; notifications?: boolean }) =>
    fetchApi<{ success: boolean; data: unknown }>('/preferences', {
      method: 'PUT',
      token,
      body: JSON.stringify(updates),
    }),

  updateLayout: (token: string, layout: unknown[]) =>
    fetchApi<{ success: boolean; data: unknown }>('/preferences/layout', {
      method: 'PUT',
      token,
      body: JSON.stringify({ layout }),
    }),

  // Widgets
  getAvailableWidgets: () =>
    fetchApi<{ success: boolean; data: unknown[] }>('/widgets/available'),

  getWidgetData: (widgetId: string, token?: string) =>
    fetchApi<{ success: boolean; data: unknown }>(`/widgets/${widgetId}/data`, {
      token,
    }),

  // Health
  healthCheck: () =>
    fetchApi<{ success: boolean; data: { status: string; timestamp: string; version: string } }>('/health'),
};
