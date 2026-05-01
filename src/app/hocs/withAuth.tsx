'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface WithAuthProps {
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  { redirectTo = '/login' }: WithAuthProps = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push(redirectTo);
      }
    }, [user, loading, router, redirectTo]);

    // Show loading spinner while checking auth state
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // Show nothing while redirecting
    if (!user) {
      return null;
    }

    // User is authenticated, render the component
    return <Component {...props} />;
  };
}
