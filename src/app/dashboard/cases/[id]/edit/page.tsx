'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import AdminRoute from '../../../../components/AdminRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import { requireAdmin } from '@/utils/roleUtils';

interface LegalCase {
  id: string;
  title: string;
  status: 'Active' | 'Pending' | 'Blocked';
  description: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface FirestoreError {
  code?: string;
  message: string;
}

export default function EditCasePage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const id = params.id as string;

  // Debug authentication
  console.log('User UID:', user?.uid);
  console.log('User Role:', role);
  
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Blocked'>('Active');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchCase = async () => {
      try {
        // Check if browser is online before making Firestore calls
        if (typeof window !== 'undefined' && !navigator.onLine) {
          setError('client is offline');
          setLoading(false);
          return;
        }

        const caseDoc = await getDoc(doc(db, "cases", id));
        
        if (caseDoc.exists()) {
          const caseData = {
            id: caseDoc.id,
            title: caseDoc.data()?.title || '',
            status: caseDoc.data()?.status || 'Active',
            description: caseDoc.data()?.description || '',
            createdAt: caseDoc.data()?.createdAt,
            updatedAt: caseDoc.data()?.updatedAt
          };
          setLegalCase(caseData);
          
          // Pre-fill form with existing data
          setTitle(caseData.title);
          setStatus(caseData.status as 'Active' | 'Pending' | 'Blocked');
          setDescription(caseData.description);
          setError(null);
        } else {
          setError('Case not found');
        }
        setLoading(false);
      } catch (error) {
        const firestoreError = error as FirestoreError;
        
        // Handle Firebase offline errors and connection issues
        const isOfflineError = error instanceof Error && (
          error.message.includes('offline') || 
          error.message.includes('unavailable') ||
          firestoreError.code === 'unavailable' ||
          error.message.includes('client is offline') ||
          error.message.includes('GRPC error') ||
          error.message.includes('has no .code')
        );
        
        // Only log non-offline and non-GRPC errors to reduce console noise
        if (!isOfflineError) {
          console.error("Firestore error:", firestoreError.code, firestoreError.message);
        }
        
        if (isOfflineError) {
          setError('Connection error');
        } else {
          setError('Error loading case');
        }
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Debug before role check
    console.log('Attempting update - User UID:', user?.uid);
    console.log('Attempting update - User Role:', role);

    // Check if user is admin before updating case
    if (!requireAdmin(role, () => {
      alert('Unauthorized');
      return;
    })) {
      return;
    }

    console.log('Role check passed - proceeding with update');

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if browser is online before making Firestore calls
      if (typeof window !== 'undefined' && !navigator.onLine) {
        setError('client is offline');
        setIsSubmitting(false);
        return;
      }

      const caseRef = doc(db, "cases", id);
      await updateDoc(caseRef, {
        title: title.trim(),
        status,
        description: description.trim(),
        updatedAt: Timestamp.now()
      });

      // Redirect back to case details
      router.push(`/dashboard/cases/${id}`);
    } catch (error) {
      const firestoreError = error as FirestoreError;
      
      // Handle Firebase offline errors and connection issues
      const isOfflineError = error instanceof Error && (
        error.message.includes('offline') || 
        error.message.includes('unavailable') ||
        firestoreError.code === 'unavailable' ||
        error.message.includes('client is offline') ||
        error.message.includes('GRPC error') ||
        error.message.includes('has no .code')
      );
      
      // Only log non-offline and non-GRPC errors to reduce console noise
      if (!isOfflineError) {
        console.error("Firestore error:", firestoreError.code, firestoreError.message);
      }
      
      if (isOfflineError) {
        setError('Connection error - unable to save changes');
      } else {
        setError('Error updating case');
      }
      setIsSubmitting(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Case...</h1>
          <p className="text-gray-600">Please wait while we fetch the case details.</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    if (error === 'client is offline' || error === 'Connection error') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Connection Error</h1>
            <p className="text-gray-600 mb-6">Unable to connect to the database. Please check your internet connection and try again.</p>
            <Link 
              href="/dashboard/cases"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      );
    }
    
    if (error === 'Case not found') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Case Not Found</h1>
            <p className="text-gray-600 mb-6">The case you're trying to edit doesn't exist.</p>
            <Link 
              href="/dashboard/cases"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Case</h1>
          <p className="text-gray-600 mb-6">There was an error loading this case. Please try again later.</p>
          <Link 
            href="/dashboard/cases"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  // Handle case not found
  if (!legalCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Case Not Found</h1>
          <p className="text-gray-600 mb-6">The case you're trying to edit doesn't exist.</p>
          <Link 
            href="/dashboard/cases"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/dashboard/cases/${id}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Case</h1>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Case Details</h2>
            <p className="text-gray-600 mt-1">Update the information for this case.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707a8 8 0 00-16 8 8 8 0 000 16zM8.707 1 1 0 001.414 1.414L10 11.414 10l1.293 1.293a1 1 0 001.414 1.414L12 12.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Title Field */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Case Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="Enter case title"
                required
              />
            </div>

            {/* Status Field */}
            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Pending' | 'Blocked')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                placeholder="Enter case description"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-2 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12h4zm2 5.291A7.962 7.962 0 014 12h4zm2 5.291A7.962 7.962 0 014 12h4zm2 5.291A7.962 7.962 0 014 12h4z" clipRule="evenodd" />
                    </svg>
                    Saving Changes...
                  </span>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              
              <Link
                href={`/dashboard/cases/${id}`}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
      </AdminRoute>
  );
}
