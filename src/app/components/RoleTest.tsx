'use client';

import { useAuth } from '../contexts/AuthContext';

export default function RoleTest() {
  const { user, userDoc, role, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">User Role Test Component</h2>
      
      {user ? (
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>UID:</strong> {user.uid}</p>
          <p><strong>Role:</strong> {role || 'Not loaded'}</p>
          <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          
          {userDoc && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <h3 className="font-medium">User Document:</h3>
              <pre className="text-sm">
                {JSON.stringify(userDoc, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
}
