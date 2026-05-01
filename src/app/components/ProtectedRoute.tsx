'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  requireAdmin = false,
  fallback
}: ProtectedRouteProps) {
  const { user, loading, initializing, role, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth is fully initialized and not loading
    if (!initializing && !loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requireAdmin && role !== 'admin') {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, initializing, role, error, router, redirectTo, requireAdmin]);

  // Show loading spinner during initialization or loading states
  if (initializing || loading) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-spin border-t-indigo-600 animation-delay-150"></div>
          </div>
          <p className="text-slate-600 text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200 max-w-md mx-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Authentication Error</h3>
              <p className="text-slate-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || (requireAdmin && role !== 'admin')) {
    return null;
  }

  // User is authenticated (and has required role), show the protected content
  return <>{children}</>;
}
