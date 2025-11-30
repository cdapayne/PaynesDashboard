export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface Widget {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  icon: string;
  enabled: boolean;
  comingSoon: boolean;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  dashboardLayout: WidgetLayout[];
  notifications: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
