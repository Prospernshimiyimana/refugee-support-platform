'use client';

import { useState } from 'react';
import { fixSantosUser } from '../lib/createUserDocument';

export default function FixUserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleFixUser = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const result = await fixSantosUser();
      if (result.success) {
        setResult('✅ User document created successfully! The user should now have proper permissions.');
      } else {
        setResult(`❌ Failed to create user document: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Fix User Document</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            This page will create a user document for <strong>santos@gmail.com</strong> 
            (UID: 7eNrYPfUWChg6lOw2PLrnjU5np82) to fix the permission issues.
          </p>
          <p className="text-sm text-gray-500">
            The user will be assigned the role of 'user' by default.
          </p>
        </div>

        <button
          onClick={handleFixUser}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating User Document...' : 'Create User Document'}
        </button>

        {result && (
          <div className="mt-4 p-3 rounded-md bg-gray-100">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          <p>After creating the user document, refresh the main application to see if the permission issues are resolved.</p>
        </div>
      </div>
    </div>
  );
}
