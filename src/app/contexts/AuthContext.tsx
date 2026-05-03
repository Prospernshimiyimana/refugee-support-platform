'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { logout, onAuthStateChanged as firebaseOnAuthStateChanged } from '../lib/auth';
import { createUserDocument, getUserDocument, UserDocument } from '../lib/userService';

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
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasInitialized = useRef(false);

  // Log initialization only once
  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('🔐 AuthProvider: Initializing AuthProvider');
      hasInitialized.current = true;
    }
  }, []);

  const refreshUser = async () => {
    console.log('🔐 AuthProvider: Refreshing user document...');
    if (user) {
      try {
        const userData = await getUserDocument(user.uid);
        if (!userData) {
          // Create user document if it doesn't exist
          console.log('🔐 AuthProvider: User document missing, creating one...');
          await createUserDocument({
            uid: user.uid,
            email: user.email || ''
          });
          const newUserData = await getUserDocument(user.uid);
          setUserDoc(newUserData);
        } else {
          setUserDoc(userData);
        }
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
        console.error('🔐 AuthProvider: Error refreshing user document:', err);
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    // Clean up any existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    console.log('🔐 AuthProvider: Setting up auth state listener');
    
    const unsubscribe = firebaseOnAuthStateChanged(async (authUser) => {
      console.log('🔐 AuthProvider: Auth state changed:', authUser ? 'User signed in' : 'User signed out');
      
      try {
        setUser(authUser);
        setError(null);
        
        if (authUser) {
          console.log('🔐 AuthProvider: User authenticated - UID:', authUser.uid);
          
          // Ensure user document exists
          let userData = await getUserDocument(authUser.uid);
          if (!userData) {
            console.log('🔐 AuthProvider: User document missing, creating one...');
            try {
              await createUserDocument({
                uid: authUser.uid,
                email: authUser.email || ''
              });
              userData = await getUserDocument(authUser.uid);
              console.log('🔐 AuthProvider: User document created and loaded:', userData);
            } catch (createError) {
              console.error('🔐 AuthProvider: Failed to create user document:', createError);
              // Create minimal fallback document in memory
              userData = {
                uid: authUser.uid,
                email: authUser.email || '',
                role: 'user'
              } as UserDocument;
              console.log('🔐 AuthProvider: Using fallback user document:', userData);
            }
          }
          
          if (userData) {
            console.log('🔐 AuthProvider: User document loaded:', userData);
            setUserDoc(userData);
            
            // Auto-promote to admin if email suggests admin (for development)
            if (userData.email && (userData.email.includes('admin') || userData.email.includes('test'))) {
              if (userData.role !== 'admin') {
                console.log('🔐 AuthProvider: Auto-promoting user to admin (development mode)');
                try {
                  const { forceCreateAdminDocument } = await import('../lib/adminFix');
                  await forceCreateAdminDocument();
                  // Refresh user data after promotion
                  userData = await getUserDocument(authUser.uid);
                  if (userData) {
                    setUserDoc(userData);
                    console.log('🔐 AuthProvider: User promoted to admin:', userData);
                  }
                } catch (err) {
                  console.warn('🔐 AuthProvider: Failed to auto-promote:', err);
                }
              }
            }
          } else {
            console.error('🔐 AuthProvider: No user data available - creating emergency fallback');
            // Emergency fallback to prevent app crash
            const emergencyDoc: UserDocument = {
              uid: authUser.uid,
              email: authUser.email || '',
              role: 'user'
            };
            setUserDoc(emergencyDoc);
            console.log('🔐 AuthProvider: Emergency fallback document created:', emergencyDoc);
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

    // Store unsubscribe function and cleanup on unmount
    unsubscribeRef.current = unsubscribe;
    
    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth state listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
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
  
  // Debug logging for user role
  useEffect(() => {
    if (user) {
      console.log('🔐 AuthContext Debug:');
      console.log('   User Email:', user.email);
      console.log('   User UID:', user.uid);
      console.log('   User Document:', userDoc);
      console.log('   User Role:', userRole);
      console.log('   Is Admin:', adminStatus);
      console.log('   Auth Loading:', loading);
      console.log('   Initializing:', initializing);
    } else {
      console.log('🔐 AuthContext: No user authenticated');
    }
  }, [user, userDoc, userRole, adminStatus, loading, initializing]);

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
