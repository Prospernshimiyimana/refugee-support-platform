'use client';

import { useState, useEffect } from 'react';
import { listenToNewsUpdates, type NewsArticle } from '../../lib/newsService';
import { User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSafeFirestore } from '../hooks/useSafeFirestore';

// Helper function to get localized content with fallback
function getLocalizedContent(article: NewsArticle, language: 'en' | 'rw') {
  if (language === 'rw') {
    return {
      title: article.title_rw || article.title_en || 'Untitled Article',
      content: article.content_rw || article.content_en || 'No content available',
    };
  }
  return {
    title: article.title_en || article.title_rw || 'Untitled Article',
    content: article.content_en || article.content_rw || 'No content available',
  };
}

export default function NewsPage() {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isReady, withAuthCheck } = useSafeFirestore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle loading state when user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('📰 NewsPage: User not authenticated, setting loading to false');
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setLoading(false);
        setError(null);
      }, 0);
    }
  }, [authLoading, user]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;
    
    // Only fetch news if user is authenticated and auth is ready
    if (!isReady || !user || authLoading) {
      return () => {
        isMounted = false;
      };
    }
    
    // Set up real-time listener for news with authentication guard
    const setupNewsListener = withAuthCheck('listenToNewsUpdates', 'news', async () => {
      console.log('📰 NewsPage: Setting up news listener for authenticated user:', user?.uid || 'unknown');
      
      unsubscribe = listenToNewsUpdates((newsData: NewsArticle[]) => {
        if (isMounted) {
          // Only show published news
          const publishedNews = newsData.filter((article: NewsArticle) => article.status === 'published');
          setArticles(publishedNews);
          setLoading(false);
          setError(null);
        }
      });
      
      return unsubscribe;
    });

    setupNewsListener().catch(error => {
      console.error('📰 NewsPage: Error setting up news listener:', error);
      if (isMounted) {
        setError('Failed to load news articles');
        setLoading(false);
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading, isReady, withAuthCheck]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading news...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading news</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Latest Updates
        </h1>
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No updates yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Check back soon for the latest news and updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const localizedContent = getLocalizedContent(article, language);
              return (
                <Link key={article.id} href={`/news/${article.id}`} className="group block">
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-blue-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {localizedContent.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {article.summary || localizedContent.content.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>{article.author}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300">
                      Read more
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
