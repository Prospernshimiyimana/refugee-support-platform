'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminRoute from '../components/AdminRoute';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getNewsTitle, getNewsContent } from '@/lib/multilingual';
import { realtimeService } from '../../lib/realtimeService';
import { firestoreNotificationService } from '../../lib/firestoreNotificationService';
import { exportService } from '../../lib/exportService';
import { auditService } from '../../lib/auditService';
import { createNews, getAllNews, updateNews, deleteNews, listenToNewsUpdates, type NewsArticle, type CreateNewsData } from '../../lib/newsService';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from 'firebase/firestore';

// Type definitions for form values
type NewsStatus = 'draft' | 'published' | 'archived';

// Type definitions for data structures
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
  const { role, loading: authLoading, initializing, error, isAdmin } = useAuth();
  const { language } = useLanguage();
  
  // Debug logging for dashboard access
  useEffect(() => {
    console.log('🎯 Dashboard Debug:');
    console.log('   Role:', role);
    console.log('   Is Admin:', isAdmin);
    console.log('   Auth Loading:', authLoading);
    console.log('   Initializing:', initializing);
    console.log('   Error:', error);
  }, [role, isAdmin, authLoading, initializing, error]);
  
  // Local state for forms - must be declared before any early returns
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsType, setStatsType] = useState<'users' | 'news'>('news');
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
    newsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const [newsStats, setNewsStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });

  // Form state for error handling
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize real-time data subscriptions
  useEffect(() => {
    if (!db || !isAdmin) return;

    let hasReceivedData = false;

    // Subscribe to news updates
    const unsubscribeNews = listenToNewsUpdates((newsData) => {
      console.log('📰 Dashboard: Real-time news update received:', newsData.length, 'articles');
      setNewsArticles(newsData);
      setNewsLoading(false);
      setNewsError(null);
      
      // Update news stats
      const stats = {
        total: newsData.length,
        published: newsData.filter(n => n.status === 'published').length,
        draft: newsData.filter(n => n.status === 'draft').length,
        archived: newsData.filter(n => n.status === 'archived').length
      };
      setNewsStats(stats);
      
      // Update dashboard stats
      setDashboardStats(prev => ({
        ...prev,
        newsCount: stats.total
      }));

      // Set stats loading to false only after first data received
      if (!hasReceivedData) {
        setStatsLoading(false);
        hasReceivedData = true;
      }
    });

    // Subscribe to users count
    const unsubscribeUsers = realtimeService.subscribeToUsers((users) => {
      console.log('👥 Dashboard: Real-time users count update:', users.length);
      setDashboardStats(prev => ({
        ...prev,
        usersCount: users.length
      }));

      // Set stats loading to false only after first data received
      if (!hasReceivedData) {
        setStatsLoading(false);
        hasReceivedData = true;
      }
    });

    return () => {
      if (unsubscribeNews) unsubscribeNews();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [db, isAdmin]);

  // Form handlers
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    if (!newNews.title_en.trim()) {
      setFormError('English title is required');
      return;
    }
    
    if (!newNews.title_rw.trim()) {
      setFormError('Kinyarwanda title is required');
      return;
    }
    
    if (!newNews.content_en.trim()) {
      setFormError('English content is required');
      return;
    }
    
    if (!newNews.content_rw.trim()) {
      setFormError('Kinyarwanda content is required');
      return;
    }
    
    if (!newNews.author.trim()) {
      setFormError('Author is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Check if user is admin before proceeding
      if (!isAdmin) {
        throw new Error('Unauthorized access');
      }
      
      if (!db) {
        throw new Error('Database not available');
      }
      
      const docRef = await addDoc(collection(db, "news"), {
        title_en: newNews.title_en.trim(),
        title_rw: newNews.title_rw.trim(),
        content_en: newNews.content_en.trim(),
        content_rw: newNews.content_rw.trim(),
        author: newNews.author.trim(),
        summary: newNews.summary?.trim() || '',
        status: newNews.status,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create audit log for news creation
      try {
        await auditService.logNewsCreation(docRef.id, newNews.title_en.trim());
      } catch (auditError) {
        console.error('Error creating news audit log:', auditError);
      }
      
      // Create notification for new news
      try {
        await firestoreNotificationService.createNewsNotification(docRef.id, newNews.title_en.trim());
      } catch (notificationError) {
        console.error('Error creating news notification:', notificationError);
      }
      
      setShowNewsForm(false);
      setNewNews({ 
        title_en: '', 
        title_rw: '', 
        content_en: '', 
        content_rw: '',
        author: '',
        summary: '',
        status: 'published'
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setFormError(`Failed to create news: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics handlers
  const handleShowStats = async (type: 'users' | 'news') => {
    setStatsType(type);
    setShowStatsModal(true);
  };

  // Export handlers
  const handleExport = async (type: 'users' | 'news') => {
    try {
      setIsExporting(true);
      
      if (type === 'news') {
        await exportService.exportNewsToCSV();
      }
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle loading state
  if (authLoading || initializing) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h1>
            <p className="text-gray-600">Please wait while we set up your workspace.</p>
          </div>
        </div>
      </AdminRoute>
    );
  }

  // Handle error state
  if (error) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Authentication Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminRoute>
    );
  }

  // Handle non-admin users
  if (!isAdmin) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Access Denied</div>
            <p className="text-gray-600 mb-4">You don&apos;t have permission to access the admin dashboard.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-4">
              {language === 'rw' ? 'Urwego rwa Muyobozi' : 'Admin Dashboard'}
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Manage news and monitor platform activity with powerful tools and real-time insights.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{dashboardStats.usersCount || 0}</div>
                    <div className="text-xs text-blue-200">Total Users</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{dashboardStats.newsCount || 0}</div>
                    <div className="text-xs text-blue-200">News Articles</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowNewsForm(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create News
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-blue-200 hover:scale-105 hover:-translate-y-2 active:scale-95 opacity-0 translate-y-4 animate-in" onClick={() => handleShowStats('users')} role="button" tabIndex={0} aria-label="View total users statistics">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {dashboardStats.usersCount || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors duration-300">
                        Total Users
                      </div>
                      <div className="mt-2 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">View details</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total News Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-95 group-hover:scale-100"></div>
              <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 hover:border-emerald-200 hover:scale-105 hover:-translate-y-2 active:scale-95 opacity-0 translate-y-4 animate-in" onClick={() => handleShowStats('news')} role="button" tabIndex={0} aria-label="View total news statistics">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                        {newsStats.total}
                      </div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-emerald-600 transition-colors duration-300">
                        Total News
                      </div>
                      <div className="mt-2 flex items-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">View details</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent News Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Recent News</h2>
              <p className="text-gray-600 mt-2">Latest news articles published on the platform</p>
            </div>
            <div className="p-8">
              {newsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading news...</p>
                </div>
              ) : newsError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">Error loading news</div>
                  <p className="text-gray-600">{newsError}</p>
                </div>
              ) : newsArticles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No news articles yet</div>
                  <button 
                    onClick={() => setShowNewsForm(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create first news article
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {newsArticles.slice(0, 5).map((article) => (
                    <div key={article.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {getNewsTitle(language, article)}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {getNewsContent(language, article).substring(0, 150)}...
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>By {article.author}</span>
                            <span>{new Date(article.createdAt?.toDate?.() || article.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              article.status === 'published' ? 'bg-green-100 text-green-800' :
                              article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {article.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {newsArticles.length > 5 && (
                    <div className="text-center pt-4">
                      <Link 
                        href="/dashboard/news"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all news →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* News Creation Modal */}
        {showNewsForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full max-h-screen overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create News Article</h3>
              
              {formError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{formError}</p>
                </div>
              )}
              
              <form onSubmit={handleNewsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                    <input
                      type="text"
                      value={newNews.title_en}
                      onChange={(e) => setNewNews({...newNews, title_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter news title in English"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title (Kinyarwanda)</label>
                    <input
                      type="text"
                      value={newNews.title_rw}
                      onChange={(e) => setNewNews({...newNews, title_rw: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter news title in Kinyarwanda"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={newNews.author}
                    onChange={(e) => setNewNews({...newNews, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter author name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                  <textarea
                    value={newNews.summary}
                    onChange={(e) => setNewNews({...newNews, summary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief summary of the news article"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content (English)</label>
                    <textarea
                      value={newNews.content_en}
                      onChange={(e) => setNewNews({...newNews, content_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={6}
                      placeholder="Enter news content in English"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content (Kinyarwanda)</label>
                    <textarea
                      value={newNews.content_rw}
                      onChange={(e) => setNewNews({...newNews, content_rw: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={6}
                      placeholder="Enter news content in Kinyarwanda"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newNews.status}
                    onChange={(e) => setNewNews({...newNews, status: e.target.value as NewsStatus})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create News'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewsForm(false);
                      setFormError(null);
                      setNewNews({
                        title_en: '',
                        title_rw: '',
                        content_en: '',
                        content_rw: '',
                        author: '',
                        summary: '',
                        status: 'published'
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {statsType === 'users' ? 'User Statistics' : 'News Statistics'}
              </h3>
              
              {statsType === 'users' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{dashboardStats.usersCount}</div>
                    <div className="text-sm text-blue-800">Total Registered Users</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-600">{newsStats.published}</div>
                      <div className="text-sm text-emerald-800">Published</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">{newsStats.draft}</div>
                      <div className="text-sm text-yellow-800">Draft</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-600">{newsStats.archived}</div>
                      <div className="text-sm text-gray-800">Archived</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{newsStats.total}</div>
                      <div className="text-sm text-blue-800">Total</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => handleExport(statsType)}
                  disabled={isExporting}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : `Export ${statsType}`}
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AdminRoute>
  );
}
