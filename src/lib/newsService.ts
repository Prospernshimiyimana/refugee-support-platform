import { 
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { firestoreNotificationService } from './firestoreNotificationService';
import { 
  safeGetAllDocuments, 
  safeGetDocumentById, 
  safeAddDoc, 
  safeUpdateDoc, 
  safeDeleteDoc,
  safeOnSnapshot,
  safeQuery
} from '../app/lib/safeFirestore';

// Type definitions
export interface NewsArticle {
  id?: string;
  title_en: string;
  title_rw: string;
  content_en: string;
  content_rw: string;
  author: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status?: 'draft' | 'published' | 'archived';
  summary?: string;
}

export interface CreateNewsData {
  title_en: string;
  title_rw: string;
  content_en: string;
  content_rw: string;
  author: string;
  summary?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateNewsData {
  title_en?: string;
  title_rw?: string;
  content_en?: string;
  content_rw?: string;
  author?: string;
  summary?: string;
  status?: 'draft' | 'published' | 'archived';
}

/**
 * Create a new news article
 * @param newsData - The news article data
 * @returns Promise<NewsArticle> - The created news article with ID
 */
export async function createNews(newsData: CreateNewsData): Promise<NewsArticle> {
  console.log('📰 NewsService: Creating news article with safe Firestore');
  
  try {
    const now = Timestamp.now();
    
    const docData = {
      title_en: newsData.title_en,
      title_rw: newsData.title_rw,
      content_en: newsData.content_en,
      content_rw: newsData.content_rw,
      author: newsData.author,
      summary: newsData.summary || '',
      status: newsData.status || 'published',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await safeAddDoc('news', docData);
    console.log(`📰 NewsService: Successfully created news article ${docRef.id}`);
    
    // Create notification if news is published
    if (docData.status === 'published') {
      try {
        await firestoreNotificationService.createNewsNotification(docRef.id, newsData.title_en);
      } catch (notificationError) {
        console.warn('Failed to create notification for news:', notificationError);
        // Don't throw error here - news creation should still succeed
      }
    }
    
    // Return the created document with its ID
    return {
      id: docRef.id,
      ...docData
    };
  } catch (error) {
    console.error('📰 NewsService: Error creating news article:', error);
    throw new Error('Failed to create news article');
  }
}

/**
 * Get all news articles
 * @param statusFilter - Optional status filter
 * @param limitCount - Optional limit for number of articles
 * @returns Promise<NewsArticle[]> - Array of news articles
 */
export async function getAllNews(
  statusFilter?: 'draft' | 'published' | 'archived',
  limitCount?: number
): Promise<NewsArticle[]> {
  console.log('📰 NewsService: Starting getAllNews with safe Firestore operations');
  
  try {
    const options: {
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      limit?: number;
      where?: { field: string; operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any'; value: string | number | boolean };
    } = {
      orderBy: { field: 'createdAt', direction: 'desc' }
    };
    
    if (statusFilter) {
      options.where = { field: 'status', operator: '==', value: statusFilter };
    }
    
    if (limitCount) {
      options.limit = limitCount;
    }

    const news = await safeGetAllDocuments('news', options);
    console.log(`📰 NewsService: Successfully fetched ${news.length} news articles`);
    return news as NewsArticle[];
  } catch (error) {
    console.error('📰 NewsService: Error in getAllNews:', error);
    
    // Handle permission errors gracefully
    if (error instanceof Error && error.message.includes('Permission denied')) {
      console.warn('📰 NewsService: Permission denied, returning empty news array');
      return []; // Return empty array instead of throwing
    }
    
    throw new Error('Failed to fetch news articles');
  }
}

/**
 * Get a single news article by ID
 * @param id - The news article ID
 * @returns Promise<NewsArticle | null> - The news article or null if not found
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  console.log(`📰 NewsService: Getting news article ${id} with safe Firestore`);
  
  try {
    const news = await safeGetDocumentById('news', id);
    console.log(`📰 NewsService: Successfully fetched news article ${id}`);
    return news as NewsArticle | null;
  } catch (error) {
    console.error('📰 NewsService: Error fetching news article:', error);
    
    // Handle permission errors gracefully
    if (error instanceof Error && error.message.includes('Permission denied')) {
      console.warn('📰 NewsService: Permission denied for news article:', id);
      return null; // Return null instead of throwing
    }
    
    throw new Error('Failed to fetch news article');
  }
}

/**
 * Update a news article
 * @param id - The news article ID
 * @param updateData - The data to update
 * @returns Promise<NewsArticle> - The updated news article
 */
export async function updateNews(id: string, updateData: UpdateNewsData): Promise<NewsArticle> {
  console.log(`📰 NewsService: Updating news article ${id} with safe Firestore`);
  
  try {
    const updateDocData = {
      ...updateData,
      updatedAt: Timestamp.now()
    };
    
    await safeUpdateDoc('news', id, updateDocData);
    console.log(`📰 NewsService: Successfully updated news article ${id}`);
    
    // Return the updated document
    const updated = await getNewsById(id);
    if (!updated) {
      throw new Error('News article not found after update');
    }
    
    return updated;
  } catch (error) {
    console.error('📰 NewsService: Error updating news article:', error);
    throw new Error('Failed to update news article');
  }
}

/**
 * Delete a news article
 * @param id - The news article ID
 * @returns Promise<boolean> - True if deleted successfully
 */
export async function deleteNews(id: string): Promise<boolean> {
  console.log(`📰 NewsService: Deleting news article ${id} with safe Firestore`);
  
  try {
    await safeDeleteDoc('news', id);
    console.log(`📰 NewsService: Successfully deleted news article ${id}`);
    return true;
  } catch (error) {
    console.error('📰 NewsService: Error deleting news article:', error);
    throw new Error('Failed to delete news article');
  }
}

/**
 * Get latest news articles (published only)
 * @param limitCount - Number of articles to fetch (default: 5)
 * @returns Promise<NewsArticle[]> - Array of latest news articles
 */
export async function getLatestNews(limitCount: number = 5): Promise<NewsArticle[]> {
  return getAllNews('published', limitCount);
}

/**
 * Listen to real-time updates for news articles
 * @param callback - Function to call when news changes
 * @param statusFilter - Optional status filter
 * @returns Unsubscribe function to stop listening
 */
export function listenToNewsUpdates(
  callback: (news: NewsArticle[]) => void,
  statusFilter?: 'draft' | 'published' | 'archived'
): Unsubscribe {
  console.log('📰 NewsService: Setting up real-time listener with safe Firestore');
  
  try {
    // Always filter by status to avoid permission issues
    const filterStatus = statusFilter || 'published';
    
    // Build query using safe query builders
    const queryFn = safeQuery.combine(
      safeQuery.orderBy('createdAt', 'desc'),
      safeQuery.where('status', '==', filterStatus)
    );

    console.log(`📰 NewsService: Setting up real-time listener for ${filterStatus} news`);

    const unsubscribe = safeOnSnapshot('news', (querySnapshot) => {
      const news: NewsArticle[] = [];
      
      querySnapshot.forEach((doc: { id: string; data: () => Omit<NewsArticle, 'id'> }) => {
        const data = doc.data();
        news.push({
          id: doc.id,
          ...data
        });
      });

      console.log(`📰 NewsService: Real-time update received: ${news.length} articles`);
      callback(news);
    }, queryFn, (error: Error) => {
      console.error('📰 NewsService: Error listening to news updates:', error);
      
      // If permission error, fallback to fetching data once
      if (error.message?.includes('Permission denied') || error.message?.includes('Missing or insufficient permissions')) {
        console.log('📰 NewsService: Permission error, falling back to one-time fetch');
        getAllNews(filterStatus).then(news => {
          console.log(`📰 NewsService: Fallback fetch returned ${news.length} articles`);
          callback(news);
        }).catch(fetchError => {
          console.error('📰 NewsService: Fallback fetch also failed:', fetchError);
        });
      }
    });

    console.log(`📰 NewsService: Real-time listener setup successful for ${filterStatus} news`);
    return unsubscribe;
  } catch (error) {
    console.error('📰 NewsService: Error setting up news listener:', error);
    
    // Fallback to regular fetch if listener setup fails
    getAllNews(statusFilter || 'published').then(news => {
      console.log(`📰 NewsService: Setup fallback fetch returned ${news.length} articles`);
      callback(news);
    }).catch(fetchError => {
      console.error('📰 NewsService: Setup fallback fetch failed:', fetchError);
      throw new Error('Failed to set up news listener');
    });
    
    // Return a dummy unsubscribe function
    return () => {};
  }
}

/**
 * Get news statistics
 * @returns Promise<Object> - News statistics
 */
export async function getNewsStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  archived: number;
}> {
  try {
    const allNews = await getAllNews();
    
    const stats = {
      total: allNews.length,
      published: allNews.filter(news => news.status === 'published').length,
      draft: allNews.filter(news => news.status === 'draft').length,
      archived: allNews.filter(news => news.status === 'archived').length
    };

    return stats;
  } catch (error) {
    console.error('Error fetching news stats:', error);
    throw new Error('Failed to fetch news statistics');
  }
}
