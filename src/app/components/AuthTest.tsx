'use client';

import React, { useState } from 'react';
import { testAuthSystem, getAuthSystemStatus } from '../lib/authMigration';
import { signUp, login } from '../lib/robustAuthService';

export default function AuthTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const runAuthTest = async () => {
    setIsLoading(true);
    setTestResults(['🧪 Starting authentication test...']);
    
    try {
      const result = await testAuthSystem();
      setTestResults(result.details);
    } catch (error) {
      setTestResults(prev => [...prev, `💥 Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = () => {
    const authStatus = getAuthSystemStatus();
    setStatus(authStatus);
  };

  const quickSignupTest = async () => {
    setIsLoading(true);
    setTestResults(['📝 Testing quick signup...']);
    
    try {
      const testEmail = `quick-test-${Date.now()}@example.com`;
      const result = await signUp(testEmail, 'test123456');
      
      if (result.success) {
        setTestResults(prev => [...prev, 
          `✅ Quick signup successful`,
          `👤 User ID: ${result.user?.uid}`,
          `📧 Email: ${result.user?.email}`,
          `📄 User document created: ${result.userDoc ? 'Yes' : 'No'}`
        ]);
      } else {
        setTestResults(prev => [...prev, `❌ Quick signup failed: ${result.error}`]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `💥 Quick test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔐 Authentication System Test</h2>
      
      {/* Status */}
      {status && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">System Status</h3>
          <p><strong>Using Robust Auth:</strong> {status.usingRobustAuth ? 'Yes ✅' : 'No ⚠️'}</p>
          <p><strong>Environment:</strong> {status.environment}</p>
          {status.recommendations.length > 0 && (
            <div className="mt-2">
              <strong>Recommendations:</strong>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {status.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Test Controls */}
      <div className="space-y-4 mb-6">
        <button
          onClick={runAuthTest}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running Full Test...' : '🧪 Run Full Authentication Test'}
        </button>
        
        <button
          onClick={quickSignupTest}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : '⚡ Quick Signup Test'}
        </button>
        
        <button
          onClick={checkStatus}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 text-sm font-mono">
            {testResults.map((result, i) => (
              <div key={i} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') || result.includes('💥') ? 'text-red-600' : 'text-gray-700'}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">📋 How to Use:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Run Full Authentication Test" for comprehensive testing</li>
          <li>Click "Quick Signup Test" for a simple signup verification</li>
          <li>Check the results for any errors or warnings</li>
          <li>Verify that Firestore user documents are created automatically</li>
        </ol>
      </div>
    </div>
  );
}
