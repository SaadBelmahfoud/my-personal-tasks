'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { QueryCacheProvider } from '@/lib/query-cache';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryCacheProvider>
        {children}
        <Toaster />
      </QueryCacheProvider>
    </ThemeProvider>
  );
}
