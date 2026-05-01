'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, AuthResult } from '../lib/auth';
import AuthForm from '../components/AuthForm';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError('');

    const result = await signUp(email, password);

    if (result.success) {
      // After signup, redirect to dashboard
      router.push('/dashboard');
    } else {
      setError(result.error || 'Authentication failed');
    }

    setIsLoading(false);
    return result;
  };

  const toggleMode = () => {
    // Redirect to login page
    router.push('/login');
  };

  return (
    <AuthForm
      isSignUp={true}
      onSubmit={handleSubmit}
      onToggleMode={toggleMode}
      isLoading={isLoading}
      error={error}
    />
  );
}
