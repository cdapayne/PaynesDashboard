'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'paynes_dashboard_token';
const USER_KEY = 'paynes_dashboard_user';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem(USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

function getInitialToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip the first render's effect
    if (!isMounted.current) {
      isMounted.current = true;
      // Verify token is still valid on mount
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedToken) {
        api.getMe(storedToken)
          .then((response) => {
            setUser(response.data);
            setIsLoading(false);
          })
          .catch(() => {
            // Token invalid, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
            setIsLoading(false);
          });
      } else {
        // Use requestAnimationFrame to defer the state update
        requestAnimationFrame(() => {
          setIsLoading(false);
        });
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    const { user: userData, token: userToken } = response.data;
    
    setUser(userData);
    setToken(userToken);
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const response = await api.register(email, password, name);
    const { user: userData, token: userToken } = response.data;
    
    setUser(userData);
    setToken(userToken);
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // Continue with logout even if API call fails
      }
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
