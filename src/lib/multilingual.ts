import { useLanguage } from '../app/contexts/LanguageContext';

// Multilingual content interface
export interface MultilingualContent {
  en: string;
  rw: string;
}

// Get localized content with fallback to English
export function getLocalizedContent(
  content: { en?: string; rw?: string } | MultilingualContent,
  language: 'en' | 'rw',
  fallbackToEnglish = true
): string {
  const localizedContent = content[language];
  
  // Return the localized content if it exists
  if (localizedContent && localizedContent.trim()) {
    return localizedContent;
  }
  
  // Fallback to English if requested and English content exists
  if (fallbackToEnglish && content.en && content.en.trim()) {
    return content.en;
  }
  
  // Return the first available content as last resort
  if (content.en && content.en.trim()) return content.en;
  if (content.rw && content.rw.trim()) return content.rw;
  
  // Return empty string if no content is available
  return '';
}

// Hook for getting localized content
export function useLocalizedContent() {
  const { language } = useLanguage();
  
  return {
    getLocalized: (
      content: { en?: string; rw?: string } | MultilingualContent,
      fallbackToEnglish = true
    ) => getLocalizedContent(content, language, fallbackToEnglish),
    language,
  };
}

// Utility function for cases
export function getCaseTitle(language: 'en' | 'rw', caseData: { title_en?: string; title_rw?: string }): string {
  return getLocalizedContent(
    { en: caseData.title_en || '', rw: caseData.title_rw || '' },
    language
  );
}

export function getCaseDescription(language: 'en' | 'rw', caseData: { description_en?: string; description_rw?: string }): string {
  return getLocalizedContent(
    { en: caseData.description_en || '', rw: caseData.description_rw || '' },
    language
  );
}

// Utility function for news
export function getNewsTitle(language: 'en' | 'rw', newsData: { title_en?: string; title_rw?: string }): string {
  return getLocalizedContent(
    { en: newsData.title_en || '', rw: newsData.title_rw || '' },
    language
  );
}

export function getNewsContent(language: 'en' | 'rw', newsData: { content_en?: string; content_rw?: string }): string {
  return getLocalizedContent(
    { en: newsData.content_en || '', rw: newsData.content_rw || '' },
    language
  );
}
