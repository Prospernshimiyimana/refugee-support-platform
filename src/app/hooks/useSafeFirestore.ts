import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreLogger } from '../lib/firestoreLogger';

/**
 * Safe Firestore hook that ensures authentication before operations
 * Prevents unauthorized requests and provides comprehensive logging
 */
export function useSafeFirestore() {
  const { user, loading: authLoading, initializing, error } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Check if authentication is ready for Firestore operations
  useEffect(() => {
    const ready = !initializing && !authLoading && !!user && !error;
    setIsReady(ready);
    
    if (ready) {
      console.log('🔐 SafeFirestore: Authentication ready for Firestore operations', {
        uid: user.uid,
        email: user.email
      });
    } else if (!initializing && !authLoading) {
      console.warn('🔐 SafeFirestore: Authentication not ready', {
        initializing,
        authLoading,
        hasUser: !!user,
        error
      });
    }
  }, [user, authLoading, initializing, error]);

  // Wrapper for Firestore operations that checks authentication first
  const withAuthCheck = useCallback(<T extends any[], R>(
    operationName: string,
    collection: string,
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      // Wait for authentication to be ready
      if (!isReady) {
        console.warn(`🔐 SafeFirestore: Operation ${operationName} blocked - authentication not ready`);
        throw new Error('Authentication not ready. Please wait for authentication to complete.');
      }

      // Log authentication state before operation
      firestoreLogger.logAuthState(operationName, collection);

      // Check user document exists (important for role-based rules)
      try {
        const userDocExists = await firestoreLogger.logUserDocumentCheck(user.uid);
        if (!userDocExists) {
          console.warn(`🔐 SafeFirestore: User document does not exist for UID: ${user.uid}`);
        }
      } catch (error) {
        console.error(`🔐 SafeFirestore: Error checking user document:`, error);
      }

      try {
        console.log(`🔐 SafeFirestore: Executing ${operationName} on ${collection}`);
        const result = await fn(...args);
        console.log(`🔐 SafeFirestore: ${operationName} completed successfully`);
        return result;
      } catch (error) {
        firestoreLogger.logError(operationName, collection, error);
        throw error;
      }
    };
  }, [isReady, user]);

  // Safe real-time listener wrapper
  const withAuthListener = useCallback(<T extends any[]>(
    operationName: string,
    collection: string,
    setupListener: (...args: T) => (() => void)
  ) => {
    return (...args: T): (() => void) => {
      if (!isReady) {
        console.warn(`🔐 SafeFirestore: Listener ${operationName} blocked - authentication not ready`);
        return () => {}; // Return empty unsubscribe function
      }

      firestoreLogger.logAuthState(operationName, collection);

      try {
        console.log(`🔐 SafeFirestore: Setting up listener ${operationName} on ${collection}`);
        const unsubscribe = setupListener(...args);
        console.log(`🔐 SafeFirestore: Listener ${operationName} setup successful`);
        return unsubscribe;
      } catch (error) {
        firestoreLogger.logError(operationName, collection, error);
        return () => {}; // Return empty unsubscribe function on error
      }
    };
  }, [isReady]);

  return {
    // Authentication state
    isReady,
    user,
    authLoading,
    initializing,
    error,

    // Safe operation wrappers
    withAuthCheck,
    withAuthListener,

    // Convenience methods
    canRead: isReady,
    canWrite: isReady,
    canCreate: isReady,
    canUpdate: isReady,
    canDelete: isReady
  };
}
