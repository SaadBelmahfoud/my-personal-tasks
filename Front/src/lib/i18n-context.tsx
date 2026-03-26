'use client';

import { useCallback } from 'react';
import { useAppStore, Locale, useAppHydration } from '@/stores/app-store';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';

const translations: Record<Locale, typeof en> = { en, fr };

type TranslationKey = string;

function getNestedValue(obj: unknown, key: string): string | undefined {
  const keys = key.split('.');
  let value: unknown = obj;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  // Normalize key - ensure no extra underscores or encoding issues
  const normalizedKey = key.trim();
  
  const value = getNestedValue(translations[locale], normalizedKey);

  if (!value) {
    // Fallback to French first (default language), then English
    const fallbackFr = getNestedValue(translations.fr, normalizedKey);
    if (fallbackFr) {
      if (params) {
        return Object.entries(params).reduce(
          (str, [paramKey, paramValue]) =>
            str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
          fallbackFr
        );
      }
      return fallbackFr;
    }
    
    // Then fallback to English
    const fallbackEn = getNestedValue(translations.en, normalizedKey);
    if (!fallbackEn) {
      // Return the original key (not modified) for debugging
      return normalizedKey;
    }
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) =>
          str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
        fallbackEn
      );
    }
    return fallbackEn;
  }

  if (params) {
    return Object.entries(params).reduce(
      (str, [paramKey, paramValue]) =>
        str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
      value
    );
  }

  return value;
}

export function useTranslations(namespace?: string) {
  const locale = useAppStore((state) => state.locale);

  // Use useCallback to ensure the returned function is stable
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return translate(locale, fullKey, params);
  }, [locale, namespace]);

  return t;
}

// Helper function to translate status values (TaskStatus, TaskPriority, etc.)
export function useStatusTranslation() {
  const t = useTranslations();
  
  const getStatusLabel = useCallback((status: string): string => {
    // Convert status to lowercase for key lookup
    // IN_PROGRESS -> in_progress
    const key = status.toLowerCase();
    return t(`taskStatus.${key}`);
  }, [t]);
  
  const getPriorityLabel = useCallback((priority: string): string => {
    const key = priority.toLowerCase();
    return t(`taskPriority.${key}`);
  }, [t]);
  
  const getProjectStatusLabel = useCallback((status: string): string => {
    const key = status.toLowerCase();
    return t(`projectStatus.${key}`);
  }, [t]);
  
  return { getStatusLabel, getPriorityLabel, getProjectStatusLabel };
}

export function useLocale() {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);

  return {
    locale,
    setLocale,
  };
}

// Simple provider that doesn't use context (avoids SSR issues)
export function I18nProvider({ children }: { children: React.ReactNode }) {
  return children;
}
