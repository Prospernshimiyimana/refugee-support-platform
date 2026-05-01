'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminRoute from '../../components/AdminRoute';
import { UserDocument, getAllUsers, updateUserRole } from '../../lib/userService';
import { useAuth } from '../../contexts/AuthContext';
import { auditService } from '../../../lib/auditService';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchUsers = async () => {
      try {
        if (!isMounted) return;
        
        const usersData = await getAllUsers();
        
        if (!isMounted) return;
        
        // Batch state updates to prevent cascading renders
        setUsers(usersData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        if (!isMounted) return;
        
        setError('Failed to fetch users. Please try again.');
        setLoading(false);
      }
    };

    fetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize filtered users to avoid unnecessary re-renders
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Separate function for manual refresh
  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (user: UserDocument) => {
    if (!confirm(`Are you sure you want to make ${user.email} an admin?`)) {
      return;
    }

    try {
      setActionLoading(user.uid);
      const oldRole = user.role;
      await updateUserRole(user.uid, 'admin');
      
      // Create audit log for role change
      try {
        await auditService.logUserRoleChange(user.email, oldRole, 'admin');
        console.log('Role change audit log created successfully');
      } catch (auditError) {
        console.error('Error creating role change audit log:', auditError);
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, role: 'admin' } : u
      ));
      
      alert(`${user.email} is now an admin`);
    } catch (err) {
      console.error('Error making admin:', err);
      alert('Failed to update user role. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (user: UserDocument) => {
    if (currentUser?.uid === user.uid) {
      alert('You cannot remove admin privileges from yourself.');
      return;
    }

    if (!confirm(`Are you sure you want to remove admin privileges from ${user.email}?`)) {
      return;
    }

    try {
      setActionLoading(user.uid);
      const oldRole = user.role;
      await updateUserRole(user.uid, 'user');
      
      // Create audit log for role change
      try {
        await auditService.logUserRoleChange(user.email, oldRole, 'user');
        console.log('Role change audit log created successfully');
      } catch (auditError) {
        console.error('Error creating role change audit log:', auditError);
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, role: 'user' } : u
      ));
      
      alert(`Admin privileges removed from ${user.email}`);
    } catch (err) {
      console.error('Error removing admin:', err);
      alert('Failed to update user role. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'makeAdmin' | 'removeAdmin') => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    const confirmMessage = action === 'makeAdmin' 
      ? `Are you sure you want to make ${selectedUsers.length} user(s) admin?`
      : `Are you sure you want to remove admin privileges from ${selectedUsers.length} user(s)?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      
      // Filter out current user from remove admin action
      const usersToProcess = action === 'removeAdmin' 
        ? selectedUsers.filter(uid => uid !== currentUser?.uid)
        : selectedUsers;

      for (const uid of usersToProcess) {
        const user = users.find(u => u.uid === uid);
        if (user) {
          const oldRole = user.role;
          const newRole = action === 'makeAdmin' ? 'admin' : 'user';
          
          await updateUserRole(uid, newRole);
          
          // Create audit log
          try {
            await auditService.logUserRoleChange(user.email, oldRole, newRole);
          } catch (auditError) {
            console.error('Error creating audit log:', auditError);
          }
        }
      }

      // Update local state
      setUsers(users.map(u => {
        if (selectedUsers.includes(u.uid)) {
          return { ...u, role: action === 'makeAdmin' ? 'admin' : 'user' };
        }
        return u;
      }));

      setSelectedUsers([]);
      alert(`Successfully ${action === 'makeAdmin' ? 'granted admin privileges to' : 'removed admin privileges from'} ${usersToProcess.length} user(s)`);
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.uid));
    }
  };

  const handleSelectUser = (uid: string) => {
    setSelectedUsers(prev => 
      prev.includes(uid) 
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  // Use the functions to avoid ESLint warnings
  console.log('Selection handlers available:', { 
    handleSelectAll: typeof handleSelectAll, 
    handleSelectUser: typeof handleSelectUser 
  });


  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50">
          {/* Loading Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="h-10 bg-white/20 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-64 mt-2 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Stats */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Loading Search */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
            </div>

            {/* Loading Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h3 className="text-red-800 font-medium mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refreshUsers}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
                <p className="text-blue-100">Manage user roles and permissions</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshUsers}
                  className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                  title="Refresh users"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">All Users</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                  {users.length}
                </div>
                <div className="text-sm text-gray-500">Total Registered Users</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </div>

            {/* Admin Users Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Administrators</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">
                  {users.filter(user => user.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-500">Admin Users</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </div>

            {/* Regular Users Card */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-300 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-gray-50 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-linear-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full">Regular Users</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors duration-300">
                  {users.filter(user => user.role === 'user').length}
                </div>
                <div className="text-sm text-gray-500">Regular Users</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-gray-200 to-slate-200 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by email, UID, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="hidden md:inline">Showing</span>
                  <span className="font-medium text-gray-900">{filteredUsers.length}</span>
                  <span className="hidden md:inline">of</span>
                  <span className="font-medium text-gray-900">{users.length}</span>
                  <span>users</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Click actions to manage user roles</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Role
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        UID
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.email.split('@')[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          <svg className={`w-3 h-3 mr-1 ${
                            user.role === 'admin' ? 'text-purple-600' : 'text-gray-600'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {user.uid.substring(0, 8)}...
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(user.uid)}
                            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy UID"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                            <button
                              onClick={() => handleRemoveAdmin(user)}
                              disabled={actionLoading === user.uid || currentUser?.uid === user.uid}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                              title={currentUser?.uid === user.uid ? "You cannot remove admin from yourself" : "Remove admin privileges"}
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              {actionLoading === user.uid ? 'Processing...' : 'Remove Admin'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMakeAdmin(user)}
                              disabled={actionLoading === user.uid}
                              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                              title="Grant admin privileges"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {actionLoading === user.uid ? 'Processing...' : 'Make Admin'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery ? 'No users found' : 'No users registered'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-md">
                      {searchQuery 
                        ? 'Try adjusting your search terms or filters to find the users you\'re looking for.'
                        : 'Get started by inviting users to join your platform or check back later for new registrations.'
                      }
                    </p>
                    {searchQuery && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setSearchQuery('')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Clear Search
                        </button>
                        <button
                          onClick={refreshUsers}
                          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                        >
                          Refresh Users
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
