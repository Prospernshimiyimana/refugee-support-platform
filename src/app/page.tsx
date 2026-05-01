'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, Shield, User, Search, Bell, BarChart3, Users, Globe, Zap } from 'lucide-react';
import { listenToNewsUpdates, type NewsArticle } from '../lib/newsService';
import { caseService, type LegalCase } from '../lib/caseService';
import { getDashboardStats, getCurrentUser, type UserDocument } from './lib/userService';
import { useLanguage } from './contexts/LanguageContext';
import { getNewsTitle, getNewsContent, getCaseTitle, getCaseDescription } from '../lib/multilingual';
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
    casesCount: 0,
    newsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Latest cases data
  const [latestCases, setLatestCases] = useState<LegalCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  
  const { language } = useLanguage();

  // Authentication listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getCurrentUser();
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

    return unsubscribe;
  }, []);

  // Fetch latest news (works for both authenticated and unauthenticated users)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (!authLoading) {
      const fetchNews = async () => {
        try {
          // Set up real-time listener for published news only (works for all users)
          unsubscribe = listenToNewsUpdates((news) => {
            // Only show published news and get the latest 3
            const publishedNews = news
              .filter(article => article.status === 'published')
              .slice(0, 3);
            setLatestNews(publishedNews);
            setNewsLoading(false);
            setNewsError(null);
          }, 'published');
        } catch (error) {
          console.error('Error fetching latest news:', error);
          setNewsError('Failed to load latest news');
          setNewsLoading(false);
        }
      };

      fetchNews();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authLoading]);

  // Fetch stats data (only when user is authenticated)
  useEffect(() => {
    let isMounted = true;
    
    if (!authLoading && user) {
      const fetchStats = async () => {
        try {
          const statsData = await getDashboardStats();
          if (isMounted) {
            setStats(statsData);
            setStatsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
          if (isMounted) {
            setStatsLoading(false);
          }
        }
      };

      fetchStats();
    } else if (!authLoading && !user) {
      // User is not authenticated, set loading to false in next tick
      const timer = setTimeout(() => {
        if (isMounted) {
          setStatsLoading(false);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  // Fetch latest cases (only when user is authenticated)
  useEffect(() => {
    let isMounted = true;
    
    if (!authLoading && user) {
      const fetchCases = async () => {
        try {
          const allCases = await caseService.getAllCases();
          // Sort by createdAt (most recent first) and get latest 3
          const sortedCases = allCases
            .sort((a, b) => {
              if (a.createdAt && b.createdAt) {
              return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
          })
          .slice(0, 3);
        if (isMounted) {
          setLatestCases(sortedCases);
          setCasesLoading(false);
        }
      } catch (error) {
        console.error('Error fetching latest cases:', error);
        if (isMounted) {
          setCasesError('Failed to load latest cases');
          setCasesLoading(false);
        }
      }
    };

    fetchCases();
    } else if (!authLoading && !user) {
      // User is not authenticated, set loading to false in next tick
      const timer = setTimeout(() => {
        if (isMounted) {
          setCasesLoading(false);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-20 overflow-hidden">
        {/* Subtle background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl transform -translate-x-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left order-2 lg:order-1 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border border-blue-200/50 shadow-sm">
                <span className="mr-2 text-lg">🌍</span>
                {language === 'rw' ? 'Urubuga rw\'Amakuru ku Mpunzi' : 'Trusted Refugee Information Platform'}
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                {language === 'rw' ? (
                  <>
                    <span className="block mb-2">Sisitemu yo Gukurikirana</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Imanza n&apos;Amakuru ku Mpunzi</span>
                  </>
                ) : (
                  <>
                    <span className="block mb-2">Refugee Support &</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Legal Case Tracking System</span>
                  </>
                )}
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl font-light">
                {language === 'rw' 
                  ? 'Reba imanza z\'impunzi, amakuru y\'amategeko, n\'amatangazo mu Kinyarwanda n\'Icyongereza.'
                  : 'Access real-time refugee cases, legal updates, news articles, and notifications in English and Kinyarwanda.'
                }
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 mb-12">
                <Link
                  href="/cases"
                  className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-400 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    {language === 'rw' ? 'Reba Imanza' : 'View Cases'}
                    <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform duration-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-full group-hover:translate-x-0"></div>
                </Link>
                <Link
                  href="/news"
                  className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-400 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 border-2 border-blue-200"
                >
                  <span className="relative z-10 flex items-center">
                    {language === 'rw' ? 'Amakuru Mashya' : 'Latest News'}
                    <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform duration-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  {/* Button hover glow */}
                  <div className="absolute inset-0 bg-blue-50 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-400"></div>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center text-gray-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  {language === 'rw' ? 'Ibyanditswe byizewe' : 'Verified refugee cases'}
                </div>
                <div className="flex items-center text-gray-600 font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  {language === 'rw' ? 'Amategeko y\'amategeko' : 'Legal updates & notifications'}
                </div>
                <div className="flex items-center text-gray-600 font-medium">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" style={{animationDelay: '1s'}}></div>
                  {language === 'rw' ? 'Amakuru y\'amatangazo' : 'News articles & resources'}
                </div>
              </div>
            </div>
            
            {/* Right Column - Illustration */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="relative w-full max-w-md">
                {/* Main illustration container */}
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-white/30">
                  {/* Illustration content */}
                  <div className="aspect-square bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-32 h-32 border-2 border-blue-300/30 rounded-full"></div>
                      <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-indigo-300/30 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 w-40 h-40 border-2 border-purple-300/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    
                    {/* Central justice scale */}
                    <div className="relative z-10">
                      {/* Animated balance beams */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent transform rotate-45 animate-pulse"></div>
                        <div className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent transform rotate-12 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                        <div className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent transform rotate-78 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      </div>
                      
                      {/* Central justice icon */}
                      <div className="relative w-36 h-36 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                        <svg className="relative z-10 w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6l4 4v10l2-2V9l-2-2H5v2l2 2v6l-2-2V9l-2-2H3zm0 18h8v2H3v-2h8v2z"/>
                          <path d="M12 5c1.1 0 2 .9 2 2s-.9 2-2 2-.9 2-2h8c17.5 0 18 1.5 18v2c18 1.5 18 1.5 18H4c-1.1 0-2 .9-2 2v-2C2 14.9 1.1 14 14H4c-1.1 0-2 .9-2 2v-2C2 10.9 1.1 10 10H4c-1.1 0-2 .9-2 2v-2C2 6.9 1.1 6 6H4c-1.1 0-2 .9-2 2v-2C2 2.9 1.1 2 2H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2z"/>
                        </svg>
                        
                        {/* Floating refugee figures */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.8s'}}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79 4-4H4c-1.1 0-2 .9-2 2v-2C2 14.9 1.1 14 14H4c-1.1 0-2 .9-2 2v-2C2 10.9 1.1 10 10H4c-1.1 0-2 .9-2 2v-2C2 6.9 1.1 6 6H4c-1.1 0-2 .9-2 2v-2C2 2.9 1.1 2 2H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2z"/>
                          </svg>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1.2s'}}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79 4-4H4c-1.1 0-2 .9-2 2v-2C2 14.9 1.1 14 14H4c-1.1 0-2 .9-2 2v-2C2 10.9 1.1 10 10H4c-1.1 0-2 .9-2 2v-2C2 6.9 1.1 6 6H4c-1.1 0-2 .9-2 2v-2C2 2.9 1.1 2 2H4c-1.1 0-2 .9-2 2v-2C2 1.9 1.1 1 1H4c-1.1 0-2 .9-2 2v-2z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced floating cards */}
                <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-2xl p-4 border border-blue-100 animate-float" style={{animationDelay: '0.4s'}}>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-600">{language === 'rw' ? 'Ibyanditswe' : 'Legal Cases'}</p>
                      <p className="text-xs text-gray-500">{language === 'rw' ? 'Byizewe n\'Urwego' : 'Verified & Tracked'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-4 border border-green-100 animate-float" style={{animationDelay: '0.6s'}}>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m0 0l-3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">{language === 'rw' ? 'Amategeko' : 'Real-time Updates'}</p>
                      <p className="text-xs text-gray-500">{language === 'rw' ? 'Igihe cy\'izere' : 'Live Notifications'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -right-10 bg-white rounded-2xl shadow-2xl p-4 border border-purple-100 animate-float" style={{animationDelay: '0.8s'}}>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2s2-.9 2-2v-1c0 .62.08 1.21.21 1.79 0 4.08-3.06 7.44-7 7.93z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-purple-600">{language === 'rw' ? 'Amakuru' : 'News & Resources'}</p>
                      <p className="text-xs text-gray-500">{language === 'rw' ? 'Yose impunzi' : 'Global Information'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Real Data */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'rw' ? 'Imibare Ibyashye' : 'Platform Statistics'}
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
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {language === 'rw' ? 'Ikiyega' : 'Active'}
                </div>
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.usersCount.toLocaleString()}
                  </div>
                  <div className="text-gray-600">
                    {language === 'rw' ? 'Abakoresho Baturuka' : 'Active Users'}
                  </div>
                </>
              )}
            </div>

            {/* Cases Stat */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {language === 'rw' ? 'Zose' : 'Total'}
                </div>
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.casesCount.toLocaleString()}
                  </div>
                  <div className="text-gray-600">
                    {language === 'rw' ? 'Imanza Ibyashye' : 'Legal Cases'}
                  </div>
                </>
              )}
            </div>

            {/* News Stat */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {language === 'rw' ? 'Zose' : 'Total'}
                </div>
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.newsCount.toLocaleString()}
                  </div>
                  <div className="text-gray-600">
                    {language === 'rw' ? 'Amakuru' : 'News Articles'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Static UI */}
      <section className="py-20 bg-white relative overflow-hidden">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Case Tracking */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Gukurikirana Imanza' : 'Case Tracking'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Kurikira imanza z\'amategeko z\'impunzi muri nyayo y\'igihe cy\'izere'
                  : 'Monitor refugee legal cases with real-time status updates and comprehensive tracking'
                }
              </p>
            </div>

            {/* News System */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Sisitemu y\'Amakuru' : 'News System'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Amakuru yashya n\'amatangazo yerekeye politiki z\'impunzi'
                  : 'Latest news and updates on refugee policies and legal developments'
                }
              </p>
            </div>

            {/* Multilingual */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Gufasha Ikiyega' : 'Multilingual'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Kinyarwanda n\'Icyongereza - Amakuru mu rurimi rwihutirwa'
                  : 'English and Kinyarwanda support for all content and communications'
                }
              </p>
            </div>

            {/* Admin Dashboard */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'rw' ? 'Urwego rwa Muyobozi' : 'Admin Dashboard'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'rw' 
                  ? 'Ubugenzuzi bwongeyeho na raporo z\'ibikorwa byose'
                  : 'Comprehensive admin tools for managing users, cases, and content'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Cases Section - Real Data */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'rw' ? 'Imanza ya Vuba' : 'Latest Cases'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'rw' 
                ? 'Imanza zashashatswe vuba z\'impunzi'
                : 'Most recent refugee legal cases'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {casesLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : casesError ? (
              <div className="col-span-full text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-red-600">{casesError}</p>
                </div>
              </div>
            ) : latestCases.length === 0 ? (
              <div className="col-span-full text-center">
                <div className="bg-gray-50 rounded-xl p-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'rw' ? 'Nta manda wabonetse' : 'No cases available yet'}
                  </p>
                </div>
              </div>
            ) : (
              latestCases.map((caseItem) => (
                <div key={caseItem.id} className="group">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {getCaseTitle(language, caseItem)}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {getCaseDescription(language, caseItem).substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          caseItem.status === 'Active' ? 'bg-green-500' : 
                          caseItem.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span>{caseItem.status}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {caseItem.createdAt?.toDate ? 
                            caseItem.createdAt.toDate().toLocaleDateString() : 
                            language === 'rw' ? 'Itariki itazwi' : 'Unknown date'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/cases/${caseItem.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300"
                      >
                        {language === 'rw' ? 'Reba ibirambuye' : 'View details'}
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {latestCases.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/cases"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {language === 'rw' ? 'Reba Imanza Zose' : 'View All Cases'}
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
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
                ? 'Amakuru ashya n\'amatangazo yerekeye politiki z\'impunzi'
                : 'Stay updated with the latest refugee policy changes and important announcements'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : newsError ? (
              <div className="col-span-full text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-red-600">{newsError}</p>
                </div>
              </div>
            ) : latestNews.length === 0 ? (
              <div className="col-span-full text-center">
                <div className="bg-gray-50 rounded-xl p-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'rw' ? 'Nta makuru wabonetse' : 'No news articles available yet'}
                  </p>
                </div>
              </div>
            ) : (
              latestNews.map((article) => (
                <div key={article.id} className="group">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group-hover:border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {getNewsTitle(language, article)}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {article.summary || getNewsContent(language, article).substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        <span>{article.author}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/news/${article.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300"
                      >
                        {language === 'rw' ? 'Soma byinshi' : 'Read more'}
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {latestNews.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/news"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {language === 'rw' ? 'Amakuru Yose' : 'View All News'}
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
