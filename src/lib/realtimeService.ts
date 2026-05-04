import { 
  DocumentData,
  Unsubscribe 
} from 'firebase/firestore';
import { safeOnSnapshot, safeQuery } from '@/app/lib/safeFirestore';
import { getAuth } from 'firebase/auth';

// Real-time listener management
class RealtimeService {
  private listeners: Map<string, Unsubscribe> = new Map();

  // Generate unique key for listener
  private getListenerKey(collection: string, queryParams: object[] = []): string {
    return `${collection}_${JSON.stringify(queryParams)}`;
  }

  // Subscribe to real-time updates for a collection
  subscribeToCollection(
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    queryParams: {
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
      where?: [string, '==' | '!=' | '>' | '<' | '>=' | '<=' | 'array-contains' | 'in' | 'array-contains-any', string | number | boolean];
      limit?: number;
    } = {}
  ): Unsubscribe {
    const key = this.getListenerKey(collectionName, [queryParams]);
    
    // Clean up existing listener if any
    if (this.listeners.has(key)) {
      const existingUnsub = this.listeners.get(key);
      if (existingUnsub) {
        existingUnsub();
      }
    }

    // Build query using safe query builders
    const queryFns = [];
    
    if (queryParams.where) {
      queryFns.push(safeQuery.where(queryParams.where[0], queryParams.where[1], queryParams.where[2]));
    }
    
    if (queryParams.orderBy) {
      queryFns.push(safeQuery.orderBy(queryParams.orderBy, queryParams.orderDirection || 'desc'));
    }
    
    if (queryParams.limit) {
      queryFns.push(safeQuery.limit(queryParams.limit));
    }

    const queryFn = queryFns.length > 0 ? safeQuery.combine(...queryFns) : undefined;

    // Subscribe to real-time updates using safe Firestore
    const unsubscribe = safeOnSnapshot(
      collectionName,
      (snapshot) => {
        const data: DocumentData[] = [];
        snapshot.forEach((doc: any) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        callback(data);
      },
      queryFn,
      (error) => {
        console.error(`Real-time subscription error for ${collectionName}:`, error);
        // For permission errors, return empty data
        if (error instanceof Error && (error.message.includes('Permission denied') || error.message.includes('No authenticated user found'))) {
          console.warn(`🔒 RealtimeService: Permission denied for ${collectionName}, returning empty data`);
          callback([]);
        }
      }
    );

    // Store unsubscribe function
    this.listeners.set(key, unsubscribe);

    return unsubscribe;
  }

  // Subscribe to users collection
  subscribeToUsers(callback: (users: DocumentData[]) => void): Unsubscribe {
    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      console.warn('Cannot subscribe to users: User not authenticated');
      callback([]); // Return empty array
      return () => {}; // Return empty unsubscribe function
    }

    return this.subscribeToCollection('users', callback, {
      orderBy: 'email',
      orderDirection: 'asc'
    });
  }

  // Subscribe to news collection (all news, filtered client-side)
  subscribeToNews(callback: (news: DocumentData[]) => void): Unsubscribe {
    return this.subscribeToCollection('news', (allNews) => {
      // Filter to only published news on client side to avoid composite index requirement
      const publishedNews = allNews.filter(article => article.status === 'published');
      callback(publishedNews);
    }, {
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  // Subscribe to dashboard stats (real-time counts)
  subscribeToDashboardStats(callback: (stats: {
    usersCount: number;
    newsCount: number;
  }) => void): Unsubscribe {
    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      console.warn('Cannot subscribe to dashboard stats: User not authenticated');
      callback({ usersCount: 0, newsCount: 0 }); // Return zero counts
      return () => {}; // Return empty unsubscribe function
    }

    const key = this.getListenerKey('dashboard_stats');
    
    // Clean up existing listener if any
    if (this.listeners.has(key)) {
      const existingUnsub = this.listeners.get(key);
      if (existingUnsub) {
        existingUnsub();
      }
    }

    // Create separate listeners for each collection count
    let usersCount = 0;
    let casesCount = 0;
    let newsCount = 0;
    let completed = 0;

    const checkComplete = () => {
      if (completed === 3) {
        callback({ usersCount, casesCount, newsCount });
      }
    };

    // Users count
    const usersUnsub = safeOnSnapshot(
      'users',
      (snapshot: any) => {
        usersCount = snapshot.size;
        completed++;
        checkComplete();
      },
      undefined,
      (error: any) => {
        console.error('Real-time users count error:', error);
        completed++;
        checkComplete();
      }
    );

    // Cases count
    const casesUnsub = safeOnSnapshot(
      'cases',
      (snapshot: any) => {
        casesCount = snapshot.size;
        completed++;
        checkComplete();
      },
      undefined,
      (error: any) => {
        console.error('Real-time cases count error:', error);
        completed++;
        checkComplete();
      }
    );

    // News count (only published news to avoid permission issues)
    const newsQuery = safeQuery.combine(
      safeQuery.where('status', '==', 'published')
    );
    const newsUnsub = safeOnSnapshot(
      'news',
      (snapshot: any) => {
        newsCount = snapshot.size;
        completed++;
        checkComplete();
      },
      newsQuery,
      (error: any) => {
        console.error('Real-time news count error:', error);
        completed++;
        checkComplete();
      }
    );

    // Combined unsubscribe function
    const unsubscribe = () => {
      usersUnsub();
      casesUnsub();
      newsUnsub();
      this.listeners.delete(key);
    };

    this.listeners.set(key, unsubscribe);
    return unsubscribe;
  }

  // Clean up all listeners
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Remove specific listener
  removeListener(collection: string, queryParams: object[] = []): void {
    const key = this.getListenerKey(collection, queryParams);
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }
}

export const realtimeService = new RealtimeService();
