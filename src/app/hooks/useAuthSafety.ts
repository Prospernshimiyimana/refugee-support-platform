'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to ensure Firebase operations are only executed when auth is ready
 * Prevents "undefined user" errors and ensures request.auth is valid
 */
export function useAuthSafety() {
  const { user, loading, initializing, error } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Auth is ready when not initializing, not loading, and no errors
    if (!initializing && !loading && !error) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [initializing, loading, error]);

  return {
    user,
    loading,
    initializing,
    error,
    isReady,
    canProceed: isReady && !!user,
    // Helper to wrap async operations
    withAuth: <T, Args extends any[]>(
      operation: (...args: Args) => Promise<T>,
      fallback?: T | null
    ) => {
      return async (...args: Args): Promise<T | null> => {
        if (!isReady || !user) {
          console.warn('Auth not ready, operation blocked');
          return fallback !== undefined ? fallback : null;
        }

        try {
          return await operation(...args);
        } catch (error) {
          console.error('Operation failed:', error);
          return fallback !== undefined ? fallback : null;
        }
      };
    }
  };
}

/**
 * Hook for admin-only operations with safety checks
 */
export function useAdminAuthSafety() {
  const authSafety = useAuthSafety();
  const { userDoc } = useAuth();

  return {
    ...authSafety,
    isAdmin: userDoc?.role === 'admin',
    canProceedAsAdmin: authSafety.canProceed && userDoc?.role === 'admin',
    // Helper to wrap admin operations
    withAdminAuth: <T, Args extends any[]>(
      operation: (...args: Args) => Promise<T>,
      fallback?: T | null
    ) => {
      return async (...args: Args): Promise<T | null> => {
        if (!authSafety.canProceed || userDoc?.role !== 'admin') {
          console.warn('Admin auth not ready, operation blocked');
          return fallback !== undefined ? fallback : null;
        }

        try {
          return await operation(...args);
        } catch (error) {
          console.error('Admin operation failed:', error);
          return fallback !== undefined ? fallback : null;
        }
      };
    }
  };
}
