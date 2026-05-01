'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signUp, AuthResult } from '../lib/auth';
import AuthForm from '../components/AuthForm';
import { getUserDocument } from '../lib/userService';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError('');

    let result: AuthResult;

    if (isSignUp) {
      result = await signUp(email, password);
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      if (isSignUp) {
        // After signup, redirect to dashboard
        router.push('/dashboard');
      } else {
        // After login, fetch user role and redirect accordingly
        try {
          if (!result.user) {
            setError('Login successful but user data not available');
            setIsLoading(false);
            return result;
          }
          const userDoc = await getUserDocument(result.user.uid);
          if (userDoc?.role === 'admin') {
            router.push('/dashboard');
          } else {
            router.push('/cases');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Fallback to cases page if role fetch fails
          router.push('/cases');
        }
      }
    } else {
      setError(result.error || 'Authentication failed');
    }

    setIsLoading(false);
    return result;
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <AuthForm
      isSignUp={isSignUp}
      onSubmit={handleSubmit}
      onToggleMode={toggleMode}
      isLoading={isLoading}
      error={error}
    />
  );
}
