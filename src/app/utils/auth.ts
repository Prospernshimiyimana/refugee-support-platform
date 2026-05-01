import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if current user is authenticated
 * Returns a boolean and loading state
 */
export function useIsAuthenticated() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
}

/**
 * Hook to get current user information safely
 * Returns user object or null
 */
export function useCurrentUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}
