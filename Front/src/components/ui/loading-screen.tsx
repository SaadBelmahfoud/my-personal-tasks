'use client';

import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  /**
   * Optional message to display below the spinner
   */
  message?: string;
  /**
   * Optional className to override default styles
   */
  className?: string;
}

/**
 * A reusable full-screen loading component
 * Used during hydration, authentication checks, and data loading
 * 
 * @example
 * // Basic usage
 * if (!hydrated) return <LoadingScreen />;
 * 
 * @example
 * // With custom message
 * if (isLoading) return <LoadingScreen message="Loading projects..." />;
 */
export function LoadingScreen({ message, className = '' }: LoadingScreenProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="mt-4 text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}

/**
 * A smaller loading component for inline use
 * Used within cards, dialogs, and other containers
 * 
 * @example
 * if (isLoading) return <LoadingSpinner />;
 */
export function LoadingSpinner({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
    </div>
  );
}

export default LoadingScreen;
