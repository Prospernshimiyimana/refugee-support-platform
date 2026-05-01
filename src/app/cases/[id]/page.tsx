'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface LegalCase {
  id: string;
  title: string;
  status: string;
  description: string;
  createdAt?: Timestamp;
}

interface FirestoreError {
  code?: string;
  message: string;
}

export default function CaseDetailPage() {
  const params = useParams();
  const { loading: authLoading } = useAuth();
  const id = params.id as string;
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch Firestore data after auth is ready
    if (!id || authLoading) return;

    // Check if browser is online before making Firestore calls
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setTimeout(() => {
        setError('client is offline');
        setLoading(false);
      }, 0);
      return;
    }

    const fetchCase = async () => {
      try {
        const caseDoc = await getDoc(doc(db, "cases", id));
        
        if (caseDoc.exists()) {
          const caseData = {
            id: caseDoc.id,
            title: caseDoc.data()?.title || '',
            status: caseDoc.data()?.status || '',
            description: caseDoc.data()?.description || '',
            createdAt: caseDoc.data()?.createdAt
          };
          setLegalCase(caseData);
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

    return () => {};
  }, [id, authLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle loading state - wait for both auth and data loading
  if (loading || authLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Case...</h1>
            <p className="text-gray-600">Please wait while we fetch the case details.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Handle error states
  if (error) {
    if (error === 'client is offline' || error === 'Connection error') {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Connection Error</h1>
              <p className="text-gray-600 mb-6">Unable to connect to the database. Please check your internet connection and try again.</p>
              <Link 
                href="/cases"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Cases
              </Link>
            </div>
          </div>
        </ProtectedRoute>
      );
    }
    
    if (error === 'Case not found') {
      notFound();
    }
    
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Case</h1>
            <p className="text-gray-600 mb-6">There was an error loading this case. Please try again later.</p>
            <Link 
              href="/cases"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Handle case not found
  if (!legalCase) {
    notFound();
  }

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/cases"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Case Details</h1>
          </div>
        </div>
      </div>

      {/* Case Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Case Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                {legalCase.title}
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  legalCase.status
                )}`}
              >
                {legalCase.status}
              </span>
            </div>
          </div>

          {/* Case Content */}
          <div className="px-8 py-6">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Description</h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {legalCase.description}
              </p>
            </div>

            {/* Case Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Case Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                  <p className="text-gray-900">{legalCase.status}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Created At</h4>
                  <p className="text-gray-900">
                    {legalCase.createdAt ? 
                      legalCase.createdAt.toDate().toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href={`/dashboard/cases/${legalCase.id}/edit`}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                >
                  Edit Case
                </Link>
                <button className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  Download Documents
                </button>
                <button className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  Share Case
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Cases */}
        <div className="mt-8 text-center">
          <Link 
            href="/cases"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Cases
          </Link>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
