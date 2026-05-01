'use client';

import { useState, useEffect } from 'react';
import { listenToCases, createCase } from '../lib/firestore';
import CaseCard from '../components/CaseCard';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../../utils/roleUtils';
import { Timestamp } from 'firebase/firestore';
import { type LegalCase } from '../../lib/caseService';

export default function CasesPage() {
  const { role } = useAuth();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title_en: '',
    title_rw: '',
    description_en: '',
    description_rw: '',
    status: 'Pending'
  });
  const [statusFilter, setStatusFilter] = useState('All Status');

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const filteredCases = statusFilter === 'All Status' 
    ? cases 
    : cases.filter(c => c.status === statusFilter);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;
    
    // Set up real-time listener
    unsubscribe = listenToCases((casesData) => {
      if (isMounted) {
        setCases(casesData);
        setLoading(false);
        setError(null);
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Handler functions
  const handleNewCase = () => {
    setShowNewCaseModal(true);
  };

  
  const handleCreateCase = async () => {
    // Check if user is admin before proceeding
    if (!isAdmin(role)) {
      return;
    }

    if (!newCase.title_en.trim() || !newCase.title_rw.trim() || !newCase.description_en.trim() || !newCase.description_rw.trim()) {
      alert('All title and description fields are required');
      return;
    }

    try {
      // Create case in Firestore
      await createCase({
        title_en: newCase.title_en.trim(),
        title_rw: newCase.title_rw.trim(),
        description_en: newCase.description_en.trim(),
        description_rw: newCase.description_rw.trim(),
        status: newCase.status
      });

      setShowNewCaseModal(false);
      setNewCase({ title_en: '', title_rw: '', description_en: '', description_rw: '', status: 'Pending' });
      alert('Case created successfully!');
      
    } catch (error) {
      console.error('Error creating case:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error creating case: ${errorMessage}`);
    }
  };

  // Calculate statistics for dashboard
  const activeCases = cases.filter(c => c.status === 'Active').length;
  const pendingCases = cases.filter(c => c.status === 'Pending').length;
  const blockedCases = cases.filter(c => c.status === 'Blocked').length;

  // Show loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Loading cases...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state
  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error loading cases</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">All Cases</h1>
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                Monitor and manage refugee legal cases with real-time status updates and comprehensive tracking tools
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {isAdmin(role) && (
                <button 
                  onClick={handleNewCase}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Case
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Active Cases Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-green-200 p-8">
              <div className="flex items-center">
                <div className="shrink-0 relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-green-200">
                    <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 w-12 h-12 bg-green-200 rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-green-600 transition-colors duration-300">Active Cases</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{activeCases}</p>
                  <div className="mt-2 flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">+12% this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Cases Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-yellow-200 p-8">
              <div className="flex items-center">
                <div className="shrink-0 relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-yellow-200">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full animate-pulse"></div>
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 w-12 h-12 bg-yellow-200 rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-yellow-600 transition-colors duration-300">Pending Cases</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">{pendingCases}</p>
                  <div className="mt-2 flex items-center text-yellow-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Awaiting review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Blocked Cases Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-red-200 p-8">
              <div className="flex items-center">
                <div className="shrink-0 relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-red-200">
                    <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 w-12 h-12 bg-red-200 rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-500 group-hover:text-red-600 transition-colors duration-300">Blocked Cases</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">{blockedCases}</p>
                  <div className="mt-2 flex items-center text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Requires action</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">All Cases</h2>
              <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {filteredCases.length} cases
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="appearance-none block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl border shadow-sm bg-white hover:border-blue-400 transition-all duration-200 cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Blocked</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {filteredCases.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No cases yet</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'All Status' 
                  ? "No cases available yet. Check back soon for updates."
                  : `No cases found with status "${statusFilter}".`
                }
              </p>
              {role === 'admin' && statusFilter === 'All Status' && (
                <button 
                  onClick={handleNewCase}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Case
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((legalCase) => (
                <CaseCard key={legalCase.id} legalCase={legalCase} />
              ))}
            </div>
          )}
        </div>
      </div>

        {/* New Case Modal */}
        {showNewCaseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Case</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                  <input
                    type="text"
                    value={newCase.title_en}
                    onChange={(e) => setNewCase({...newCase, title_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter case title in English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title (Kinyarwanda)</label>
                  <input
                    type="text"
                    value={newCase.title_rw}
                    onChange={(e) => setNewCase({...newCase, title_rw: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter case title in Kinyarwanda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                  <textarea
                    value={newCase.description_en}
                    onChange={(e) => setNewCase({...newCase, description_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter case description in English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Kinyarwanda)</label>
                  <textarea
                    value={newCase.description_rw}
                    onChange={(e) => setNewCase({...newCase, description_rw: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter case description in Kinyarwanda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newCase.status}
                    onChange={(e) => setNewCase({...newCase, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleCreateCase}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Case
                </button>
                <button
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
