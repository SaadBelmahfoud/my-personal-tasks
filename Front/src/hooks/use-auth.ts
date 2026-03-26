'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if store has hydrated
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // If already hydrated, use queueMicrotask to avoid synchronous setState
    if (useAuthStore.persist.hasHydrated()) {
      queueMicrotask(() => setIsHydrated(true));
    }

    return unsub;
  }, []);

  const store = useAuthStore();

  return {
    ...store,
    isHydrated,
  };
}
