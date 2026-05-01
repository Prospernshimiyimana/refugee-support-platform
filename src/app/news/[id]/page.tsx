'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getNewsById } from '../../../lib/newsService';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { getNewsTitle, getNewsContent } from '@/lib/multilingual';
import { type NewsArticle } from '../../../lib/newsService';

export default function NewsArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  const { language } = useLanguage();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) {
        setError('Article ID not found');
        setLoading(false);
        return;
      }

      try {
        const articleData = await getNewsById(articleId);
        if (articleData) {
          setArticle(articleData);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading article...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Article not found</div>
          <p className="text-gray-600 mb-4">{error || 'The requested article could not be found.'}</p>
          <Link 
            href="/news"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to News */}
        <Link 
          href="/news"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getNewsTitle(language, article)}
          </h1>
          <div className="flex items-center text-gray-600">
            <time className="text-sm">
              {new Date(article.createdAt.toDate()).toLocaleDateString()}
            </time>
          </div>
        </header>

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-sm p-8">
          {article.summary && (
            <div className="text-lg text-gray-700 mb-6 leading-relaxed border-b pb-6">
              {article.summary}
            </div>
          )}
          
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {getNewsContent(language, article)}
            </div>
          </div>
        </article>

        {/* Article Footer */}
        <footer className="mt-8 text-center">
          <Link 
            href="/news"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All News
          </Link>
        </footer>
      </div>
    </div>
  );
}
