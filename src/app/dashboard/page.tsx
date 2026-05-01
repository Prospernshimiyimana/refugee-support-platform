'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminRoute from '../components/AdminRoute';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getNewsTitle, getNewsContent } from '@/lib/multilingual';
import { checkAdminAccessByRole } from '../../utils/adminProtection';
import { realtimeService } from '../../lib/realtimeService';
import { firestoreNotificationService } from '../../lib/firestoreNotificationService';
import { exportService } from '../../lib/exportService';
import { auditService } from '../../lib/auditService';
import { createNews, getAllNews, updateNews, deleteNews, listenToNewsUpdates, type NewsArticle, type CreateNewsData } from '../../lib/newsService';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from 'firebase/firestore';

// Type definitions for form values
type CaseStatus = 'Active' | 'Pending' | 'Blocked';
type NewsStatus = 'Draft' | 'Published' | 'Archived';

// Type definitions for data structures
interface CaseData {
  id: string;
  title: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsData {
  id: string;
  title: string;
  summary: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { role, loading: authLoading, initializing, error } = useAuth();
  const { language } = useLanguage();
  
  // Local state for forms - must be declared before any early returns
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsType, setStatsType] = useState<'users' | 'cases' | 'news'>('cases');
  const [isExporting, setIsExporting] = useState(false);
  
  // News state management
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newNews, setNewNews] = useState<CreateNewsData>({
    title_en: '',
    title_rw: '',
    content_en: '',
    content_rw: '',
    author: '',
    summary: '',
    status: 'published'
  });
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    usersCount: 0,
    casesCount: 0,
    newsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const [caseStats, setCaseStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    blocked: 0
  });
  const [newsStats, setNewsStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });

  // Form state for new case
  const [newCase, setNewCase] = useState({
    title_en: '',
    title_rw: '',
    status: 'Active' as CaseStatus,
    description_en: '',
    description_rw: '',
    client: ''
  });

  // Form state for new news article
  const [newArticle, setNewArticle] = useState({
    title: '',
    summary: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Error state for form operations
  const [formError, setFormError] = useState<string | null>(null);

  // Auth-based page load protection - redirect non-admin users
  useEffect(() => {
    if (!initializing && !authLoading) {
      if (!role) {
        router.replace('/login');
      } else if (role !== 'admin') {
        router.replace('/');
      }
    }
  }, [role, authLoading, initializing, router]);

  // Fetch news articles
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const subscribeToNews = () => {
      console.log('📊 Dashboard: Setting up news listener for admin role');
      try {
        unsubscribe = listenToNewsUpdates((news) => {
          setNewsArticles(news);
          setNewsLoading(false);
          setNewsError(null);
        });
      } catch (error) {
        console.error('📊 Dashboard: Error setting up news listener:', error);
        setNewsError('Failed to load news articles');
        setNewsLoading(false);
      }
    };

    // Only subscribe if user is authenticated and has admin role
    if (role === 'admin') {
      subscribeToNews();
    } else {
      console.log('📊 Dashboard: User not admin, skipping news subscription. Role:', role);
      // Use requestAnimationFrame to avoid synchronous setState
      requestAnimationFrame(() => {
        setNewsLoading(false);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [role]);

  // Fetch dashboard statistics
  // Real-time dashboard stats
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const subscribeToStats = () => {
      unsubscribe = realtimeService.subscribeToDashboardStats((stats) => {
        setDashboardStats(stats);
        setStatsLoading(false);
        setStatsError(null);
      });
    };

    subscribeToStats();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Real-time news stats
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const subscribeToNews = () => {
      unsubscribe = realtimeService.subscribeToNews((data) => {
        const stats = {
          total: data.length,
          published: data.filter(n => n.status === 'Published').length,
          draft: data.filter(n => n.status === 'Draft').length,
          archived: data.filter(n => n.status === 'Archived').length
        };
        setNewsStats(stats);
      });
    };

    subscribeToNews();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Show loading state during auth initialization
  if (initializing || authLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate via-blue to-indigo flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-t-indigo-600 animation-delay-150"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-slate-700">Loading Dashboard</h2>
            <p className="text-slate-500 text-sm">Preparing your admin workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if auth failed
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate via-blue to-indigo flex items-center justify-center">
        <div className="bg-white opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200 max-w-md mx-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Authentication Error</h3>
              <p className="text-slate-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render dashboard content if user is admin
  if (role !== 'admin') {
    return null; // Will be redirected by useEffect
  }

  // Form handlers
  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is admin before proceeding
    if (!checkAdminAccessByRole(role)) {
      return;
    }
    
    // Validate fields
    if (!newCase.title_en.trim()) {
      setFormError('English title is required');
      return;
    }
    
    if (!newCase.title_rw.trim()) {
      setFormError('Kinyarwanda title is required');
      return;
    }
    
    if (!newCase.description_en.trim()) {
      setFormError('English description is required');
      return;
    }
    
    if (!newCase.description_rw.trim()) {
      setFormError('Kinyarwanda description is required');
      return;
    }
    
    if (!newCase.status) {
      setFormError('Status is required');
      return;
    }
    
    try {
      const docRef = await addDoc(collection(db, "cases"), {
        title_en: newCase.title_en.trim(),
        title_rw: newCase.title_rw.trim(),
        status: newCase.status,
        description_en: newCase.description_en.trim(),
        description_rw: newCase.description_rw.trim(),
        createdAt: new Date()
      });

      // Create audit log for case creation
      try {
        await auditService.logCaseCreation(docRef.id, newCase.title_en.trim());
      } catch (auditError) {
        console.error('Error creating case audit log:', auditError);
      }
      
      // Create notification for new case
      try {
        await firestoreNotificationService.createCaseNotification(docRef.id, newCase.title_en.trim());
      } catch (notificationError) {
        console.error('Error creating case notification:', notificationError);
      }
      
      setShowCaseForm(false);
      setNewCase({ 
        title_en: '', 
        title_rw: '', 
        status: 'Active', 
        description_en: '', 
        description_rw: '', 
        client: '' 
      });
      setFormError(null);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormError(`Failed to create case: ${errorMessage}`);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is admin before proceeding
    if (!checkAdminAccessByRole(role)) {
      return;
    }
    
    // Validate fields
    if (!newArticle.title.trim()) {
      alert('Title is required');
      return;
    }
    
    if (!newArticle.summary.trim()) {
      alert('Summary is required');
      return;
    }
    
    if (!newArticle.date) {
      alert('Date is required');
      return;
    }
    
    try {
      // Save news article to Firestore using addDoc directly
      const docRef = await addDoc(collection(db, "news"), {
        title: newArticle.title.trim(),
        summary: newArticle.summary.trim(),
        date: newArticle.date,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      console.log('News article created successfully with ID:', docRef.id);
      
      // Create audit log for news creation
      try {
        await auditService.logNewsCreation(docRef.id, newArticle.title.trim());
        console.log('News audit log created successfully');
      } catch (auditError) {
        console.error('Error creating news audit log:', auditError);
      }
      
      // Create notification for new news article
      try {
        await firestoreNotificationService.createNewsNotification(docRef.id, newArticle.title.trim());
        console.log('News notification created successfully');
      } catch (notificationError) {
        console.error('Error creating news notification:', notificationError);
      }
      
      setShowNewsForm(false);
      setNewArticle({ title: '', summary: '', date: new Date().toISOString().split('T')[0] });
      
      alert('News article created successfully!');
      
    } catch (error) {
      console.error('Error creating news article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error creating news article: ${errorMessage}`);
    }
  };

  // Statistics calculation functions
  const calculateCaseStats = async () => {
    try {
      const casesQuery = query(collection(db, "cases"), orderBy('createdAt', 'desc'));
      const casesSnapshot = await getDocs(casesQuery);
      const casesData = casesSnapshot.docs.map(doc => ({
        id: doc.id,
        status: doc.data().status || ''
      }));

      const stats = {
        total: casesData.length,
        active: casesData.filter(c => c.status === 'Active').length,
        pending: casesData.filter(c => c.status === 'Pending').length,
        blocked: casesData.filter(c => c.status === 'Blocked').length
      };

      setCaseStats(stats);
    } catch (error) {
      console.error('Error calculating case statistics:', error);
    }
  };

  // Statistics handlers
  const handleShowStats = async (type: 'users' | 'cases' | 'news') => {
    setStatsType(type);
    
    // Calculate statistics when showing the modal
    if (type === 'cases') {
      await calculateCaseStats();
    }
    // For users and news, stats are now real-time, no need to calculate manually
    
    setShowStatsModal(true);
  };

  const handleCloseStats = () => {
    setShowStatsModal(false);
  };

  // News handlers
  const handleCreateNews = async () => {
    // Check if user is admin before proceeding
    if (!checkAdminAccessByRole(role)) {
      return;
    }

    if (!newNews.title_en.trim() || !newNews.title_rw.trim() || !newNews.content_en.trim() || !newNews.content_rw.trim() || !newNews.author.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    setIsCreatingNews(true);
    setFormError(null);

    try {
      await createNews(newNews);
      setNewNews({
        title_en: '',
        title_rw: '',
        content_en: '',
        content_rw: '',
        author: '',
        summary: '',
        status: 'published'
      });
      setShowNewsForm(false);
      // News will be updated automatically via real-time listener
    } catch (error) {
      console.error('Error creating news article:', error);
      setFormError('Failed to create news article');
    } finally {
      setIsCreatingNews(false);
    }
  };

  const handleNewsChange = (field: keyof CreateNewsData, value: string) => {
    setNewNews(prev => ({
      ...prev,
      [field]: value
    }));
    setFormError(null);
  };

  const handleDeleteNews = async (newsId: string) => {
    // Check if user is admin before proceeding
    if (!checkAdminAccessByRole(role)) {
      return;
    }

    try {
      await deleteNews(newsId);
      // News will be updated automatically via real-time listener
    } catch (error) {
      console.error('Error deleting news article:', error);
      setFormError('Failed to delete news article');
    }
  };

  const handleExportData = async () => {
    // Check if user is admin before proceeding
    if (!checkAdminAccessByRole(role)) {
      return;
    }

    try {
      setIsExporting(true);
      console.log("Starting data export...");
      
      // Use the export service
      await exportService.exportToCSV();
      
      console.log("Data export completed successfully");
      alert("Data exported successfully! Check your downloads folder.");
      
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout title="Dashboard">
        <div className="min-h-screen bg-gray-50">
          {/* Professional Hero Section */}
          <div className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" opacity="0.1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>
            
            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white mb-6 border border-white/20">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Welcome back, Administrator
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                    <span className="block">Admin</span>
                    <span className="block text-blue-200">Dashboard</span>
                  </h1>
                  
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    Manage cases, news, and monitor platform activity with powerful tools and real-time insights.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{dashboardStats.usersCount || 0}</div>
                          <div className="text-xs text-blue-200">Total Users</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{dashboardStats.casesCount || 0}</div>
                          <div className="text-xs text-blue-200">Active Cases</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{dashboardStats.newsCount || 0}</div>
                          <div className="text-xs text-blue-200">News Articles</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setShowCaseForm(true)}
                      className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Case
                    </button>
                    <button 
                      onClick={() => setShowNewsForm(true)}
                      className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold border border-white/30 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add News
                    </button>
                  </div>
                </div>
                
                {/* Right Content - Dashboard Preview */}
                <div className="relative">
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="aspect-w-16 aspect-h-9 bg-white/5 rounded-lg mb-4">
                      <div className="h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                      <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                      <div className="h-2 bg-white/20 rounded-full w-5/6"></div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce animation-delay-1000">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {statsError && (
            <div className="max-w-7xl mx-auto px-4 -mt-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{statsError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-br from-sky to-blue rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-sky-200 hover:scale-105 hover:-translate-y-2 active:scale-95 opacity-0 translate-y-4 animate-in" onClick={() => handleShowStats('users')} role="button" tabIndex={0} aria-label="View total users statistics">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-5xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-sky-600 transition-colors duration-300">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-12 w-24 rounded-lg"></div>
                        ) : (
                          <span className="transform group-hover:scale-110 transition-transform duration-300 inline-block">
                            {dashboardStats.usersCount || 0}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-sky-600 transition-colors duration-300">
                        Total Users
                      </div>
                      <div className="mt-2 flex items-center text-sky-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={'M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z'} clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">+15% this month</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-linear-to-br from-sky to-sky rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-sky-200">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'} />
                        </svg>
                      </div>
                      {/* Animated ring */}
                      <div className="absolute inset-0 w-16 h-16 bg-sky-200 rounded-2xl opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Cases Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-br from-emerald to-green rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-emerald-200 hover:scale-105 hover:-translate-y-2 active:scale-95 opacity-0 translate-y-4 animate-in" onClick={() => handleShowStats('cases')} role="button" tabIndex={0} aria-label="View total cases statistics">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-5xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-12 w-24 rounded-lg"></div>
                        ) : (
                          <span className="transform group-hover:scale-110 transition-transform duration-300 inline-block">
                            {dashboardStats.casesCount || 0}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-emerald-600 transition-colors duration-300">
                        Total Cases
                      </div>
                      <div className="mt-2 flex items-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'} clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">8 active</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-linear-to-br from-emerald to-emerald rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-emerald-200">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                        </svg>
                      </div>
                      {/* Animated ring */}
                      <div className="absolute inset-0 w-16 h-16 bg-emerald-200 rounded-2xl opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total News Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-br from-violet to-purple rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-violet-200 hover:scale-105 hover:-translate-y-2 active:scale-95 opacity-0 translate-y-4 animate-in" onClick={() => handleShowStats('news')} role="button" tabIndex={0} aria-label="View total news statistics">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-5xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-violet-600 transition-colors duration-300">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-200 h-12 w-24 rounded-lg"></div>
                        ) : (
                          <span className="transform group-hover:scale-110 transition-transform duration-300 inline-block">
                            {dashboardStats.newsCount || 0}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-violet-600 transition-colors duration-300">
                        Total News
                      </div>
                      <div className="mt-2 flex items-center text-violet-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'} clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">3 new today</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-linear-to-br from-violet to-violet rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-violet-200">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'} />
                        </svg>
                      </div>
                      {/* Animated ring */}
                      <div className="absolute inset-0 w-16 h-16 bg-violet-200 rounded-2xl opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Dashboard Sections - Admin Only */}
          {role === 'admin' && (
            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Manage Cases Section */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-linear-to-br from-blue to-indigo rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-98 group-hover:scale-100"></div>
                  <div className="relative bg-linear-to-br from-blue to-blue border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 group">
                    <div className="flex items-start mb-6">
                      <div className="w-16 h-16 bg-linear-to-br from-blue to-blue rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                        </svg>
                      </div>
                      <div className="ml-6">
                        <h2 className="text-2xl font-bold text-blue-900 mb-1 group-hover:text-blue-800 transition-colors duration-300 transform group-hover:translate-x-1">Manage Cases</h2>
                        <p className="text-blue-700 text-sm font-medium group-hover:text-blue-600 transition-colors duration-300">Create, edit, and manage legal cases</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={() => setShowCaseForm(true)}
                        className="relative w-full bg-linear-to-r from-blue to-blue text-white py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                        aria-label="Create new case"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create New Case
                        </span>
                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">Quick Action</span>
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white opacity-20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-full group-hover:translate-x-0"></div>
                      </button>
                      <button 
                        onClick={() => router.push('/dashboard/cases')}
                        className="w-full bg-white opacity-90 text-blue-700 py-3 px-4 rounded-xl hover:bg-white transition-all duration-300 font-semibold border border-blue-200 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                        aria-label="View all cases"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                          </svg>
                          View All Cases
                        </span>
                      </button>
                      <button 
                        onClick={() => router.push('/dashboard/cases/stats')}
                        className="w-full bg-white opacity-90 text-blue-700 py-3 px-4 rounded-xl hover:bg-white transition-all duration-300 font-semibold border border-blue-200 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                        aria-label="View case statistics"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'} />
                          </svg>
                          Case Statistics
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Manage News Section */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-br from-emerald via-green to-teal rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform scale-95 group-hover:scale-100"></div>
                  <div className="relative bg-linear-to-br from-green to-green border border-green-200 rounded-xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                    <div className="flex items-start mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-linear-to-br from-green to-emerald rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0">
                          <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'} />
                          </svg>
                        </div>
                        {/* Animated ring effect */}
                        <div className="absolute inset-0 w-16 h-16 bg-green-400 rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700"></div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h2 className="text-2xl font-bold text-green-900 mb-1 group-hover:text-green-800 transition-colors duration-300">Manage News</h2>
                        <p className="text-green-700 text-sm font-medium group-hover:text-green-600 transition-colors duration-300">Create and manage news articles</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={() => setShowNewsForm(true)}
                        className="relative w-full bg-linear-to-r from-green to-emerald text-white py-4 px-4 rounded-xl hover:from-green-700 hover:to-emerald transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 overflow-hidden group"
                        aria-label="Create news article"
                      >
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                        <span className="relative flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'} />
                          </svg>
                          Create News Article
                        </span>
                        <span className="absolute -top-2 -right-2 bg-linear-to-r from-green0 to-emerald text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100 shadow-lg">Quick Action</span>
                      </button>
                    <button 
                      onClick={() => router.push('/dashboard/news')}
                      className="relative w-full bg-white opacity-90 text-green-700 py-3 px-4 rounded-xl hover:bg-white hover:text-green-800 transition-all duration-300 font-semibold border border-green-200 hover:border-green-400 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 group"
                      aria-label="View all news articles"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'} />
                        </svg>
                        View All News
                      </span>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></span>
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard/news/stats')}
                      className="relative w-full bg-white opacity-90 text-green-700 py-3 px-4 rounded-xl hover:bg-white hover:text-green-800 transition-all duration-300 font-semibold border border-green-200 hover:border-green-400 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 group"
                      aria-label="View news statistics"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'} />
                        </svg>
                        News Statistics
                      </span>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></span>
                    </button>
                  </div>
                </div>
                </div>

                {/* Recent News List */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-br from-gray to-blue rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform scale-95 group-hover:scale-100"></div>
                  <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Recent News Articles</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300">Live Updates</span>
                      </div>
                    </div>
                  {newsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : newsError ? (
                    <div className="text-red-600 text-sm">{newsError}</div>
                  ) : newsArticles.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'} />
                      </svg>
                      <p>No news articles yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {newsArticles.slice(0, 5).map((article, index) => (
                        <div key={article.id} className="group relative">
                          <div className="absolute inset-0 bg-linear-to-r from-blue to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                          <div className="relative border border-gray-100 rounded-lg p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                      article.status === 'published' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' :
                                      article.status === 'draft' ? 'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200' :
                                      'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                    }`}>
                                      {index + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 truncate">{getNewsTitle(language, article)}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 group-hover:text-gray-700 transition-colors duration-300">{article.summary || getNewsContent(language, article).substring(0, 100)}...</p>
                                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                                      <span className="flex items-center group-hover:text-blue-600 transition-colors duration-300">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {article.author}
                                      </span>
                                      <span className="flex items-center group-hover:text-blue-600 transition-colors duration-300">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                        article.status === 'published' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' :
                                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200' :
                                        'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                      }`}>
                                        {article.status || 'published'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button
                                  onClick={() => router.push(`/dashboard/news/${article.id}`)}
                                  className="relative text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-all duration-200 group"
                                >
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(article.id!)}
                                  className="relative text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-all duration-200 group"
                                >
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'} />
                                    </svg>
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {newsArticles.length > 5 && (
                        <div className="pt-4">
                          <button
                            onClick={() => router.push('/dashboard/news')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            View all {newsArticles.length} articles →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="bg-linear-to-r from-slate to-slate text-white py-3 px-4 rounded-xl hover:from-slate-700 hover:to-slate transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    System Settings
                  </span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/users')}
                  className="bg-linear-to-r from-amber to-amber text-white py-3 px-4 rounded-xl hover:from-amber-700 hover:to-amber transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'} />
                    </svg>
                    User Management
                  </span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/export')}
                  disabled={isExporting}
                  className="bg-linear-to-r from-rose to-rose text-white py-3 px-4 rounded-xl hover:from-rose-700 hover:to-rose transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center">
                    {isExporting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d={'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'}></path>
                        </svg>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'} />
                        </svg>
                        Export Data
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
          )}
      </div>

      {/* Enhanced Create Case Modal */}
      {showCaseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Create New Case</h3>
                    <p className="text-blue-100 text-sm mt-1">Add a new case to track and manage</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCaseForm(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  aria-label="Close case form"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {formError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{formError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCaseSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Case Title (English) *
                    <span className="text-xs text-gray-500 font-normal">({newCase.title_en.length}/100 characters)</span>
                  </label>
                  <input
                    type="text"
                    value={newCase.title_en}
                    onChange={(e) => setNewCase({...newCase, title_en: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter a descriptive title for the case in English"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Case Title (Kinyarwanda) *
                    <span className="text-xs text-gray-500 font-normal">({newCase.title_rw.length}/100 characters)</span>
                  </label>
                  <input
                    type="text"
                    value={newCase.title_rw}
                    onChange={(e) => setNewCase({...newCase, title_rw: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter a descriptive title for the case in Kinyarwanda"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={newCase.client || ''}
                      onChange={(e) => setNewCase({...newCase, client: e.target.value})}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Client name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Case Status
                    </label>
                    <select
                      value={newCase.status}
                      onChange={(e) => setNewCase({...newCase, status: e.target.value as 'Active' | 'Pending' | 'Blocked'})}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      <option value="Active">🟢 Active - Currently being worked on</option>
                      <option value="Pending">🟡 Pending - Waiting for action</option>
                      <option value="Blocked">🔴 Blocked - Issues preventing progress</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Case Description (English) *
                    <span className="text-xs text-gray-500 font-normal">({newCase.description_en.length} characters)</span>
                  </label>
                  <textarea
                    value={newCase.description_en}
                    onChange={(e) => setNewCase({...newCase, description_en: e.target.value})}
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Provide detailed information about the case in English, including background, issues, and requirements..."
                    required
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      💡 Tip: Include relevant details, dates, and any supporting information
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Case Description (Kinyarwanda) *
                    <span className="text-xs text-gray-500 font-normal">({newCase.description_rw.length} characters)</span>
                  </label>
                  <textarea
                    value={newCase.description_rw}
                    onChange={(e) => setNewCase({...newCase, description_rw: e.target.value})}
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Provide detailed information about the case in Kinyarwanda, including background, issues, and requirements..."
                    required
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      💡 Tip: Include relevant details, dates, and any supporting information
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Creating new case • All fields marked with * are required
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCaseForm(false)}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleCaseSubmit}
                    className="px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
          <div className="fixed inset-0 bg-gray-600 opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {statsType === 'cases' ? 'Case Statistics' : statsType === 'news' ? 'News Statistics' : 'User Statistics'}
            </h3>
            <div className="space-y-4">
              {statsType === 'cases' ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Total Cases</h4>
                    <p className="text-3xl font-bold text-blue-600">
                      {caseStats.total}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Active Cases</h4>
                    <p className="text-3xl font-bold text-green-600">
                      {caseStats.active}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Pending Cases</h4>
                    <p className="text-3xl font-bold text-yellow-600">
                      {caseStats.pending}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Blocked Cases</h4>
                    <p className="text-3xl font-bold text-red-600">
                      {caseStats.blocked}
                    </p>
                  </div>
                </>
              ) : statsType === 'news' ? (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Total Articles</h4>
                    <p className="text-3xl font-bold text-purple-600">
                      {newsStats.total}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Published Articles</h4>
                    <p className="text-3xl font-bold text-green-600">
                      {newsStats.published}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Draft Articles</h4>
                    <p className="text-3xl font-bold text-yellow-600">
                      {newsStats.draft}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Archived Articles</h4>
                    <p className="text-3xl font-bold text-red-600">
                      {newsStats.archived}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">User Registration Status</h4>
                    <p className="text-3xl font-bold text-indigo-600">
                      {dashboardStats.usersCount > 0 ? 'Active' : 'No Users'}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Account Status</h4>
                    <p className="text-lg text-green-600">
                      {dashboardStats.usersCount > 0 ? 'System Ready' : 'Awaiting Users'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseStats}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create News Modal */}
      {showNewsForm && (
        <div className="fixed inset-0 bg-gray-600 opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create News Article</h3>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (English) *</label>
                <input
                  type="text"
                  value={newNews.title_en}
                  onChange={(e) => handleNewsChange('title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter news article title in English"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (Kinyarwanda) *</label>
                <input
                  type="text"
                  value={newNews.title_rw}
                  onChange={(e) => handleNewsChange('title_rw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter news article title in Kinyarwanda"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                <input
                  type="text"
                  value={newNews.author}
                  onChange={(e) => handleNewsChange('author', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter author name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <input
                  type="text"
                  value={newNews.summary}
                  onChange={(e) => handleNewsChange('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter brief summary (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content (English) *</label>
                <textarea
                  value={newNews.content_en}
                  onChange={(e) => handleNewsChange('content_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={6}
                  placeholder="Enter news article content in English"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content (Kinyarwanda) *</label>
                <textarea
                  value={newNews.content_rw}
                  onChange={(e) => handleNewsChange('content_rw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={6}
                  placeholder="Enter news article content in Kinyarwanda"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newNews.status}
                  onChange={(e) => handleNewsChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowNewsForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                disabled={isCreatingNews}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNews}
                disabled={isCreatingNews}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingNews ? 'Creating...' : 'Create Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </AdminRoute>
  );
}
