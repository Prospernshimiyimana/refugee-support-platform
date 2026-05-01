import { useLanguage } from '../../app/contexts/LanguageContext';

// Simple translation hook that can be imported anywhere
export function useTranslation() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  return {
    t,
    language,
    setLanguage,
    isRTL,
    // Convenience methods
    currentLanguage: language,
    changeLanguage: setLanguage,
  };
}

// Export the translation function directly for convenience
export { useTranslation as t };
