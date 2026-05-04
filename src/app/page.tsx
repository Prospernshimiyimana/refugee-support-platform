'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Clock, User, Search, Bell, Users, Globe, Zap } from 'lucide-react';
import { listenToNewsUpdates, type NewsArticle } from '../lib/newsService';
import { getDashboardStats, getCurrentUserDocument, type UserDocument } from './lib/userService';
import { useLanguage } from './contexts/LanguageContext';
import { getNewsTitle, getNewsContent } from '../lib/multilingual';
import { auth } from './lib/firebase';

export default function Home() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  
  // User authentication state
  const [user, setUser] = useState<UserDocument | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Stats data
  const [stats, setStats] = useState({
    usersCount: 0,
    newsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { language } = useLanguage();

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getCurrentUserDocument();
          setUser(userDoc);
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch latest news (only when user is authenticated and profile is loaded)
  useEffect(() => {
    const isMounted = true;
    
    // Only run queries when auth is ready and user profile is loaded
    if (!authLoading && user) {
      const unsubscribe = listenToNewsUpdates((newsData) => {
        if (isMounted) {
          // Sort by createdAt (most recent first) and get latest 3
          const sortedNews = newsData
            .sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return b.createdAt.toMillis() - a.createdAt.toMillis();
              }
              return 0;
            })
            .slice(0, 3);
          setLatestNews(sortedNews);
          setNewsLoading(false);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else if (!authLoading && !user) {
      // User is not authenticated, set loading to false in next tick
      const timer = setTimeout(() => {
        if (isMounted) {
          setNewsLoading(false);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, user]);

  // Fetch stats
  useEffect(() => {
    if (!authLoading && user) {
      const fetchStats = async () => {
        try {
          const dashboardStats = await getDashboardStats();
          setStats({
            usersCount: dashboardStats.usersCount || 0,
            newsCount: dashboardStats.newsCount || 0
          });
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStats();
    } else if (!authLoading && !user) {
      // User is not authenticated, set loading to false in next tick
      setTimeout(() => {
        setStatsLoading(false);
      }, 0);
    }
  }, [authLoading, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Modern Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text Content */}
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {language === 'rw' ? 'Ibyanditswe byizewe' : 'Trusted by refugee communities'}
              </motion.div>

              {/* Heading */}
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block mb-2">
                  {language === 'rw' 
                    ? 'Urubuga rwa Support y\'Impunzi' 
                    : 'Refugee Support'
                  }
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl text-blue-600">
                  {language === 'rw' 
                    ? 'Platform' 
                    : 'Platform'
                  }
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl lg:max-w-none"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {language === 'rw' 
                  ? 'Reba amakuru y\'amategeko n\'amatangazo mu Kinyarwanda n\'Icyongereza.'
                  : 'Real-time legal updates, news, and resources for refugee communities in English and Kinyarwanda.'
                }
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/news"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {language === 'rw' ? 'Reba Amakuru' : 'View Latest News'}
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/about"
                    className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    {language === 'rw' ? 'Menya byinshi' : 'Learn More'}
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {language === 'rw' ? 'Ibyanditswe byizewe' : 'Verified content'}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  {language === 'rw' ? 'Icyerekezo cy\'igihe' : 'Real-time updates'}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" style={{animationDelay: '1s'}}></div>
                  {language === 'rw' ? 'Ururimi rwangwa' : 'Multilingual support'}
                </div>
              </motion.div>
            </motion.div>

            {/* Image Section */}
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="/ricardo-gomez-angel-cw_CxgiymqY-unsplash copy.jpg" 
                  alt="Refugee Support - Helping displaced communities find hope and safety"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </motion.div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <Users className="w-8 h-8 text-blue-600" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                <Globe className="w-6 h-6 text-green-600" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <Globe className="w-4 h-4 mr-2" />
              {language === 'rw' ? 'Imibare y\'Igikoresho' : 'Platform Impact'}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'rw' ? 'Imibare y\'Igikoresho' : 'Platform Statistics'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'rw' 
                ? 'Reba imibare y\'ibikorwa byose ku rubuga hano'
                : 'Real-time data from our refugee support platform'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Users Stat */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.usersCount.toLocaleString()}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {language === 'rw' ? 'Abakoresha' : 'Total Users'}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* News Stat */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                {statsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.newsCount.toLocaleString()}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {language === 'rw' ? 'Ingingo z\'Amakuru' : 'News Articles'}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Sessions Stat */}
            <div className="group relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {language === 'rw' ? 'Ikiyega' : 'Active'}
                </div>
                <div className="text-gray-600 font-medium">
                  {language === 'rw' ? 'Ikiyega' : 'System Status'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'rw' ? 'Ibikorwa Byacu' : 'Platform Features'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'rw' 
                ? 'Ibikoresho byuzuye byo gukurikirana politiki z\'impunzi n\'iterambere r\'amategeko'
                : 'Comprehensive tools for tracking refugee policies and legal developments'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Management */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Ubugenzuzi bw\'Amakuru' : 'News Management'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Kanda, hindura no kugenzura amakuru y\'amategeko z\'impunzi muri nyayo y\'igihe cy\'izere'
                  : 'Create, edit, and manage refugee legal news with real-time updates and comprehensive tracking'
                }
              </p>
            </div>

            {/* User Management */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Ubugenzuzi bw\'Abakoresha' : 'User Management'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Gukora abakoresha bashya, guhindura inshingano, no gukurikiranya uburenganzira'
                  : 'Create new users, manage roles and permissions, and track user activity'
                }
              </p>
            </div>

            {/* Notifications */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Amatangazo' : 'Notifications'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Wifashije kubona amatangazo y\'igihe cyose n\'ibihinduka byongeyeho'
                  : 'Stay informed with real-time notifications and important updates'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section - Real Data */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'rw' ? 'Amakuru ya Vuba' : 'Latest News'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'rw' 
                ? 'Amakuru ashya y\'amategeko n\'amatangazo'
                : 'Most recent legal updates and announcements'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : newsError ? (
              <div className="col-span-full text-center">
                <div className="text-red-600 mb-4">Error loading news</div>
                <p className="text-gray-600">{newsError}</p>
              </div>
            ) : latestNews.length === 0 ? (
              <div className="col-span-full text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'rw' ? 'Nta makuru wabonetse' : 'No news articles yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'rw' 
                    ? 'Nta makuru mashya wabonetse'
                    : 'Check back later for the latest updates'
                  }
                </p>
                {user && (
                  <Link
                    href="/news"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {language === 'rw' ? 'Reba Amakuru' : 'View News'}
                  </Link>
                )}
              </div>
            ) : (
              latestNews.map((article) => (
                <div key={article.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.createdAt?.toDate?.() || article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {getNewsTitle(language, article)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {getNewsContent(language, article)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {language === 'rw' ? 'Na' : 'By'} {article.author}
                    </span>
                    <Link
                      href={`/news/${article.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                    >
                      {language === 'rw' ? 'Soma byinshi' : 'Read more'}
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {latestNews.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/news"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'rw' ? 'Reba Amakuru Yose' : 'View All News'}
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-blue-100 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              {language === 'rw' ? 'Amakuru y\'igihe cyose' : 'Real-time updates'}
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'rw' 
              ? 'Tangira kugenzura amakuru y\'impunzi' 
              : 'Stay Informed with Refugee Legal Updates'
            }
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-blue-100">
            {language === 'rw' 
              ? 'Wifashije kubona amakuru y\'amategeko, amatangazo, n\'ibikorwa byongeyeho'
              : 'Get access to real-time legal updates, news, and comprehensive resources for refugee communities'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/news"
              className="group px-10 py-5 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              {language === 'rw' ? 'Reba Amakuru' : 'Browse News'}
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-blue-700 text-white font-semibold rounded-2xl hover:bg-blue-800 transition-all duration-300 border-2 border-white inline-flex items-center justify-center"
            >
              {language === 'rw' ? 'Injira' : 'Sign In'}
              <User className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
