'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AdminRoute({ 
  children, 
  redirectTo = '/login' 
}: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If user is not logged in → redirect to /login
        router.push(redirectTo);
      } else if (!isAdmin) {
        // If user is logged in but not admin → redirect to /
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, router, redirectTo]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !isAdmin) {
    return null;
  }

  // User is admin, show the protected content
  return <>{children}</>;
}
