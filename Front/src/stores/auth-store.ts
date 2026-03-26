import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import type { User } from '@/types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (response: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (response: AuthResponse) => set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      }),
      setTokens: (accessToken: string, refreshToken: string) => set({
        accessToken,
        refreshToken,
      }),
      logout: () => {
        // Clear localStorage completely
        if (isBrowser) {
          localStorage.removeItem('auth-storage');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook to check hydration status - prevents SSR mismatch
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    // Small delay to ensure client-side hydration
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  return hydrated;
}
