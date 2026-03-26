'use client';

import { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from 'react';

// Simple query cache for invalidation
type QueryKey = string;
type QueryInvalidator = () => void;

interface QueryCacheContextType {
  registerInvalidator: (key: QueryKey, invalidator: QueryInvalidator) => void;
  unregisterInvalidator: (key: QueryKey) => void;
  invalidateQueries: (keys: QueryKey[]) => void;
  invalidateAll: () => void;
}

const QueryCacheContext = createContext<QueryCacheContextType | null>(null);

// Common query keys
export const QUERY_KEYS = {
  MY_TASKS: 'my-tasks',
  OVERDUE_TASKS: 'overdue-tasks',
  PROJECTS: 'projects',
  PROJECT_DETAIL: 'project-detail',
  USER_STATS: 'user-stats',
  TASKS_BY_PROJECT: 'tasks-by-project',
} as const;

export function QueryCacheProvider({ children }: { children: ReactNode }) {
  const invalidatorsRef = useRef<Map<QueryKey, QueryInvalidator>>(new Map());

  const registerInvalidator = useCallback((key: QueryKey, invalidator: QueryInvalidator) => {
    invalidatorsRef.current.set(key, invalidator);
  }, []);

  const unregisterInvalidator = useCallback((key: QueryKey) => {
    invalidatorsRef.current.delete(key);
  }, []);

  const invalidateQueries = useCallback((keys: QueryKey[]) => {
    keys.forEach((key) => {
      const invalidator = invalidatorsRef.current.get(key);
      if (invalidator) {
        invalidator();
      }
    });
  }, []);

  const invalidateAll = useCallback(() => {
    invalidatorsRef.current.forEach((invalidator) => {
      invalidator();
    });
  }, []);

  return (
    <QueryCacheContext.Provider
      value={{
        registerInvalidator,
        unregisterInvalidator,
        invalidateQueries,
        invalidateAll,
      }}
    >
      {children}
    </QueryCacheContext.Provider>
  );
}

export function useQueryCache() {
  const context = useContext(QueryCacheContext);
  if (!context) {
    // Return a dummy implementation if used outside provider
    return {
      registerInvalidator: () => {},
      unregisterInvalidator: () => {},
      invalidateQueries: () => {},
      invalidateAll: () => {},
    };
  }
  return context;
}

// Hook to register a query for invalidation - properly using useEffect
export function useRegisterQuery(key: QueryKey, refetch: () => void) {
  const { registerInvalidator, unregisterInvalidator } = useQueryCache();
  
  useEffect(() => {
    registerInvalidator(key, refetch);
    
    return () => {
      unregisterInvalidator(key);
    };
  }, [key, refetch, registerInvalidator, unregisterInvalidator]);
}
