'use client';

import AuthTest from '../components/AuthTest';

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🔐 Authentication System Test</h1>
        <AuthTest />
      </div>
    </div>
  );
}
