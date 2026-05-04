// Centralized translation system for the refugee support platform
// Provides consistent multilingual support across the entire application

export type Language = 'en' | 'rw';

// Common UI translations
export const translations = {
  // Navigation
  en: {
    // Navigation
    home: 'Home',
    cases: 'Cases', 
    news: 'News',
    dashboard: 'Dashboard',
    about: 'About Us',
    contact: 'Contact',
    resources: 'Resources',
    help: 'Help Center',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    
    // Actions
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    update: 'Update',
    submit: 'Submit',
    view: 'View',
    viewDetails: 'View Details',
    readMore: 'Read More',
    viewAll: 'View All',
    
    // Status and States
    loading: 'Loading...',
    noData: 'No data found',
    noNews: 'No news articles available yet',
    noUsers: 'No users found',
    error: 'Error',
    success: 'Success',
    
    // News Management
    newsTitle: 'News Title',
    newsContent: 'News Content',
    author: 'Author',
    published: 'Published',
    draft: 'Draft',
    archived: 'Archived',
    status: 'Status',
    
    // User Management
    users: 'Users',
    activeUsers: 'Active Users',
    totalUsers: 'Total Users',
    email: 'Email',
    role: 'Role',
    admin: 'Admin',
    user: 'User',
    
    // Dashboard
    statistics: 'Statistics',
    platformStats: 'Platform Statistics',
    totalNews: 'Total News Articles',
    realTimeData: 'Real-time data from our refugee support platform',
    
    // Homepage
    platformFeatures: 'Platform Features',
    latestNews: 'Latest News',
    stayUpdated: 'Stay updated with latest refugee policy changes and important announcements',
    comprehensiveTools: 'Comprehensive tools for tracking refugee policies and legal developments',
    
    // Forms
    required: 'Required',
    optional: 'Optional',
    search: 'Search',
    filter: 'Filter',
    sortBy: 'Sort By',
    
    // Common phrases
    welcome: 'Welcome',
    hello: 'Hello',
    thankYou: 'Thank You',
    confirm: 'Confirm',
    areYouSure: 'Are you sure?',
    unknownDate: 'Unknown date',
    unknownAuthor: 'Unknown author'
  },
  
  rw: {
    // Navigation
    home: 'Ahabanza',
    cases: 'Imibano',
    news: 'Amakuru', 
    dashboard: 'Urwego rwa Muyobozi',
    about: 'Ibyacu',
    contact: 'Twandikire',
    resources: 'Ibikorwa',
    help: 'Ubufasha',
    privacy: 'Politiki y\'Ubusunzi',
    terms: 'Amabwiriza yo Serivisi',
    cookies: 'Politiki y\'Imikono',
    
    // Actions
    create: 'Tangiza',
    edit: 'Hindura',
    delete: 'Siba',
    save: 'Bika',
    cancel: 'Kureka',
    update: 'Kuvugurura',
    submit: 'Ohereza',
    view: 'Reba',
    viewDetails: 'Reba ibirambuye',
    readMore: 'Soma byinshi',
    viewAll: 'Reba Zose',
    
    // Status and States
    loading: 'Irimo gutangiza...',
    noData: 'Nta data ibonetse',
    noNews: 'Nta makuru wabonetse',
    noUsers: 'Nta mukoresha wabonetse',
    error: 'Ikosa',
    success: 'Byasohotse',
    
    // News Management
    newsTitle: 'Umutwe w\'Igitabo',
    newsContent: 'Ibigize by\'Igitabo',
    author: 'Umwanditsi',
    published: 'Yasohotse',
    draft: 'Ibyanditswe',
    archived: 'Bikijwe',
    status: 'Imimerere',
    
    // User Management
    users: 'Abakoresha',
    activeUsers: 'Abakoresho Baturuka',
    totalUsers: 'Umubare w\'Abakoresha',
    email: 'Imeri',
    role: 'Inshingano',
    admin: 'Muyobozi',
    user: 'Ukoresha',
    
    // Dashboard
    statistics: 'Imibare',
    platformStats: 'Imibare y\'Igikoresho',
    totalNews: 'Ingingo z\'Amakuru Zose',
    realTimeData: 'Reba imibare y\'ibikorwa byose ku rubuga hano',
    
    // Homepage
    platformFeatures: 'Ibikorwa Byacu',
    latestNews: 'Amakuru ya Vuba',
    stayUpdated: 'Reba amakuru ashya n\'amatangazo yerekeye politiki z\'impunzi',
    comprehensiveTools: 'Ibikoresho byuzuye byo gukurikirana politiki z\'impunzi n\'iterambere r\'amategeko',
    
    // Forms
    required: 'Bisabwa',
    optional: 'Bitashoboka',
    search: 'Shakisha',
    filter: 'Muyunguruzo',
    sortBy: 'Igena ku',
    
    // Common phrases
    welcome: 'Murakaza neza',
    hello: 'Mwaramutse',
    thankYou: 'Murakoze',
    confirm: 'Emeza',
    areYouSure: 'Uzabyemereye?',
    unknownDate: 'Itariki itazwi',
    unknownAuthor: 'Umwanditsi utazwi'
  }
} as const;

// Translation helper function
export function t(key: keyof typeof translations.en, language: Language = 'en'): string {
  try {
    // Fallback to English if Kinyarwanda translation is missing
    const langText = translations[language]?.[key] || translations.en[key];
    return langText || key;
  } catch (error) {
    console.warn(`Translation key "${key}" not found for language "${language}"`);
    return key;
  }
}

// Hook-based translation helper
export function useTranslation(language: Language) {
  return {
    t: (key: keyof typeof translations.en) => t(key, language)
  };
}

// Language persistence utilities
export const LANGUAGE_STORAGE_KEY = 'refugee-platform-language';

export function persistLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

export function getStoredLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'rw' || stored === 'en' ? stored : 'en';
  }
  return 'en';
}

// Format date according to language
export function formatDate(date: Date, language: Language): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  try {
    return date.toLocaleDateString(language === 'rw' ? 'rw-RW' : 'en-US', options);
  } catch {
    return date.toLocaleDateString();
  }
}

// Format number according to language
export function formatNumber(num: number, language: Language): string {
  try {
    return num.toLocaleString(language === 'rw' ? 'rw-RW' : 'en-US');
  } catch {
    return num.toString();
  }
}
