'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged, logout } from '../lib/auth';
import { getUserDocument, createUserDocument, UserDocument } from '../lib/userService';

interface AuthContextType {
  user: User | null;
  userDoc: UserDocument | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  logout: () => Promise<void>;
  isAdmin: boolean;
  role: 'admin' | 'user' | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔐 AuthProvider: Initializing AuthProvider');
  
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    console.log('🔐 AuthProvider: Refreshing user data...');
    if (user) {
      try {
        const userData = await getUserDocument(user.uid);
        console.log('🔐 AuthProvider: User data refreshed:', userData);
        setUserDoc(userData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
        console.error('🔐 AuthProvider: Error refreshing user document:', err);
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      console.log('🔐 AuthProvider: Auth state changed:', authUser ? 'User signed in' : 'User signed out');
      
      try {
        setUser(authUser);
        setError(null);
        
        if (authUser) {
          console.log('🔐 AuthProvider: Fetching user document for UID:', authUser.uid);
          
          try {
            const userData = await getUserDocument(authUser.uid);
            console.log('🔐 AuthProvider: User document fetched:', userData);
            setUserDoc(userData);
          } catch (userDocError) {
            console.error('🔐 AuthProvider: Failed to fetch user document:', userDocError);
            // Create user document if it doesn't exist
            try {
              console.log('🔐 AuthProvider: Creating missing user document...');
              await createUserDocument({
                uid: authUser.uid,
                email: authUser.email || ''
              });
              const userData = await getUserDocument(authUser.uid);
              console.log('🔐 AuthProvider: User document created and fetched:', userData);
              setUserDoc(userData);
            } catch (createError) {
              console.error('🔐 AuthProvider: Failed to create user document:', createError);
              // Set basic user doc with default values
              setUserDoc({
                uid: authUser.uid,
                email: authUser.email || '',
                role: 'user'
              });
            }
          }
        } else {
          console.log('🔐 AuthProvider: Clearing user document');
          setUserDoc(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication error';
        console.error('🔐 AuthProvider: Error in auth state change:', err);
        setError(errorMessage);
        setUserDoc(null);
      } finally {
        setLoading(false);
        setInitializing(false);
        console.log('🔐 AuthProvider: Auth initialization complete');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const result = await logout();
      
      if (!result.success) {
        setError(result.error || 'Logout failed');
        return;
      }
      
      setUser(null);
      setUserDoc(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout error';
      setError(errorMessage);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const adminStatus = userDoc?.role === 'admin';
  const userRole = userDoc?.role || null;

  const value: AuthContextType = {
    user,
    userDoc,
    loading,
    initializing,
    error,
    logout: handleLogout,
    isAdmin: adminStatus,
    role: userRole,
    refreshUser,
  };

  // Show loading spinner only during initial app load
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-t-indigo-600 animation-delay-150"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">Loading Refugee Support Platform</h2>
            <p className="text-slate-500 text-sm">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
