'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Translation types
export type TranslationKey = string;
export type Language = 'en' | 'rw';

// Translation interface
interface Translations {
  [key: string]: string | Translations;
}

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  loading: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


// Get nested value from object using dot notation
const getNestedValue = (obj: Translations, path: string): string | undefined => {
  return path.split('.').reduce((current: string | Translations | undefined, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }
    return undefined;
  }, obj) as string | undefined;
};

// Language Provider
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Translation cache - persists across re-renders
  const translationsCache = useRef<Record<Language, Translations>>({} as Record<Language, Translations>);
  
  // State
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize language from localStorage during component initialization
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'rw')) {
        return savedLanguage;
      }
    }
    return 'en';
  });
  
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);
  
  // Ref to track loaded language and prevent infinite loops
  const loadedRef = useRef<string | null>(null);
  // Ref to track previous translations to avoid unnecessary updates
  const prevTranslationsRef = useRef<Translations>({});

  // Load translations when language changes
  useEffect(() => {
    let cancelled = false;

    const loadTranslations = async (lang: string): Promise<Translations> => {
      // Check cache first
      if (translationsCache.current[lang as Language]) {
        return translationsCache.current[lang as Language];
      }

      try {
        const translations = await import(`../../lib/i18n/${lang}.json`);
        const data = translations.default;
        translationsCache.current[lang as Language] = data;
        return data;
      } catch (error) {
        console.error(`Failed to load translations for ${lang}:`, error);
        
        // Fallback to English if not already English
        if (lang !== 'en') {
          if (translationsCache.current['en']) {
            return translationsCache.current['en'];
          }
          try {
            const fallbackTranslations = await import(`../../lib/i18n/en.json`);
            const fallbackData = fallbackTranslations.default;
            translationsCache.current['en'] = fallbackData;
            return fallbackData;
          } catch (fallbackError) {
            console.error('Failed to load English fallback:', fallbackError);
          }
        }
        return {};
      }
    };

    const load = async () => {
      // Prevent duplicate loads - infinite loop guard
      if (loadedRef.current === language) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await loadTranslations(language);

        if (cancelled) return;

        // Only update translations if data has actually changed
        const currentDataStr = JSON.stringify(prevTranslationsRef.current);
        const newDataStr = JSON.stringify(data);
        
        if (currentDataStr !== newDataStr) {
          setTranslations(data);
          prevTranslationsRef.current = data;
        }
        
        loadedRef.current = language;
      } catch (err) {
        console.error("Translation load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [language]);

  // Set language and persist to localStorage
  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage !== language) {
      setLanguageState(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLanguage);
      }
    }
  }, []);

  // Translation function - optimized with useCallback
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    // Check loading state directly without adding to dependencies to avoid infinite loop
    if (loading) {
      return key; // Return key while loading
    }

    const translation = getNestedValue(translations, key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Return key if translation not found
    }

    // Replace parameters in translation string
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        const value = params[paramKey];
        return value !== undefined ? String(value) : match;
      });
    }

    return translation;
  }, [translations]); // eslint-disable-line react-hooks/exhaustive-deps

  // RTL support (Kinyarwanda is LTR, but keeping for future languages)
  const isRTL = false;

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
    loading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export translation function for convenience
export { useLanguage as t };
