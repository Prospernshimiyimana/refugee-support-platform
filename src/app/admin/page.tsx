'use client';

import AdminRoute from '../components/AdminRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Admin Only
              </span>
            </div>
          </div>
        </div>

        {/* Admin Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Admin Controls
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Admin Cards */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  User Management
                </h3>
                <p className="text-blue-700">
                  Manage user accounts and permissions
                </p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Manage Users
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Case Management
                </h3>
                <p className="text-green-700">
                  Create and manage legal cases
                </p>
                <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  Manage Cases
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-purple-900 mb-2">
                  Analytics
                </h3>
                <p className="text-purple-700">
                  View platform analytics and reports
                </p>
                <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                  View Analytics
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-orange-900 mb-2">
                  Settings
                </h3>
                <p className="text-orange-700">
                  Configure platform settings
                </p>
                <button className="mt-4 w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                  Platform Settings
                </button>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Admin Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">89</div>
                  <div className="text-sm text-gray-500">Active Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">23</div>
                  <div className="text-sm text-gray-500">Pending Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">44</div>
                  <div className="text-sm text-gray-500">Blocked Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">1,234</div>
                  <div className="text-sm text-gray-500">Total Page Views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
