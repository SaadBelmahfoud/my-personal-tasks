import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';

export type Locale = 'en' | 'fr';
export type Theme = 'light' | 'dark' | 'system';

interface AppState {
  locale: Locale;
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'fr', // Default to French
      theme: 'system',
      sidebarOpen: true,
      sidebarCollapsed: false,
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Hook to check hydration status - prevents SSR mismatch
export function useAppHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    // Small delay to ensure client-side hydration
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  return hydrated;
}
