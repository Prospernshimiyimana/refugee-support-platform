import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  CASES: 'cases',
  NEWS: 'news',
  USERS: 'users'
} as const;

// Case collection operations
export const casesCollection = db ? collection(db, COLLECTIONS.CASES) : null;

/**
 * Create a new case in Firestore
 * @param caseData - Case data object
 * @returns Promise<DocumentReference>
 */
export async function createCase(caseData: {
  title_en: string;
  title_rw: string;
  status: string;
  description_en: string;
  description_rw: string;
  client?: string;
  clientName?: string;
  priority?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  if (!db || !casesCollection) {
    throw new Error('Database not available');
  }
  
  const docData = {
    ...caseData,
    createdAt: Timestamp.fromDate(caseData.createdAt || new Date()),
    updatedAt: Timestamp.fromDate(caseData.updatedAt || new Date())
  };
  
  return await addDoc(casesCollection, docData);
}

/**
 * Get all cases from Firestore
 * @returns Promise<QuerySnapshot>
 */
export async function getAllCases() {
  if (!db || !casesCollection) {
    throw new Error('Database not available');
  }
  
  const q = query(casesCollection, orderBy('createdAt', 'desc'));
  return await getDocs(q);
}

/**
 * Listen to real-time updates for all cases
 * @param callback - Function to call when cases change
 * @returns Unsubscribe function
 */
export function listenToCases(callback: (cases: any[]) => void): Unsubscribe {
  if (!db || !casesCollection) {
    console.error('Database not available');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
  
  const q = query(casesCollection, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const cases = querySnapshotToArray(querySnapshot);
    callback(cases);
  }, (error) => {
    console.error('Error listening to cases:', error);
  });
}

/**
 * Get a single case by ID
 * @param id - Case document ID
 * @returns Promise<DocumentSnapshot>
 */
export async function getCaseById(id: string) {
  if (!db) {
    throw new Error('Database not available');
  }
  
  const caseDoc = doc(db, COLLECTIONS.CASES, id);
  return await getDoc(caseDoc);
}

/**
 * Update a case in Firestore
 * @param id - Case document ID
 * @param updateData - Data to update
 * @returns Promise<void>
 */
export async function updateCase(id: string, updateData: {
  title?: string;
  status?: string;
  description?: string;
  updatedAt?: Date;
}) {
  if (!db) {
    throw new Error('Database not available');
  }
  
  const caseDoc = doc(db, COLLECTIONS.CASES, id);
  const docData = {
    ...updateData,
    updatedAt: Timestamp.fromDate(updateData.updatedAt || new Date())
  };
  
  return await updateDoc(caseDoc, docData);
}

/**
 * Delete a case from Firestore
 * @param id - Case document ID
 * @returns Promise<void>
 */
export async function deleteCase(id: string) {
  if (!db) {
    throw new Error('Database not available');
  }
  
  const caseDoc = doc(db, COLLECTIONS.CASES, id);
  return await deleteDoc(caseDoc);
}

// News collection operations
export const newsCollection = db ? collection(db, COLLECTIONS.NEWS) : null;

/**
 * Create a new news article in Firestore
 * @param articleData - News article data
 * @returns Promise<DocumentReference>
 */
export async function createNewsArticle(articleData: {
  title: string;
  summary: string;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  if (!db || !newsCollection) {
    throw new Error('Database not available');
  }
  
  const docData = {
    ...articleData,
    createdAt: Timestamp.fromDate(articleData.createdAt || new Date()),
    updatedAt: Timestamp.fromDate(articleData.updatedAt || new Date())
  };
  
  return await addDoc(newsCollection, docData);
}

/**
 * Get all news articles from Firestore
 * @returns Promise<QuerySnapshot>
 */
export async function getAllNewsArticles() {
  if (!db || !newsCollection) {
    throw new Error('Database not available');
  }
  
  const q = query(newsCollection, orderBy('date', 'desc'));
  return await getDocs(q);
}

/**
 * Listen to real-time updates for all news articles
 * @param callback - Function to call when news articles change
 * @returns Unsubscribe function
 */
export function listenToNewsArticles(callback: (articles: any[]) => void): Unsubscribe {
  if (!db || !newsCollection) {
    console.error('Database not available');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
  
  const q = query(newsCollection, orderBy('date', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const articles = querySnapshotToArray(querySnapshot);
    callback(articles);
  }, (error) => {
    console.error('Error listening to news articles:', error);
  });
}

/**
 * Get a single news article by ID
 * @param id - News article document ID
 * @returns Promise<DocumentSnapshot>
 */
export async function getNewsArticleById(id: string) {
  if (!db || !newsCollection) {
    throw new Error('Database not available');
  }
  
  const newsDoc = doc(db, COLLECTIONS.NEWS, id);
  return await getDoc(newsDoc);
}

/**
 * Update a news article in Firestore
 * @param id - News article document ID
 * @param updateData - Data to update
 * @returns Promise<void>
 */
export async function updateNewsArticle(id: string, updateData: {
  title?: string;
  summary?: string;
  date?: string;
  updatedAt?: Date;
}) {
  if (!db) {
    throw new Error('Database not available');
  }
  
  const articleDoc = doc(db, COLLECTIONS.NEWS, id);
  const docData = {
    ...updateData,
    updatedAt: Timestamp.fromDate(updateData.updatedAt || new Date())
  };
  
  return await updateDoc(articleDoc, docData);
}

/**
 * Delete a news article from Firestore
 * @param id - News article document ID
 * @returns Promise<void>
 */
export async function deleteNewsArticle(id: string) {
  if (!db) {
    throw new Error('Database not available');
  }
  
  const articleDoc = doc(db, COLLECTIONS.NEWS, id);
  return await deleteDoc(articleDoc);
}

// Utility functions
/**
 * Convert Firestore document to plain object
 * @param doc - Firestore document snapshot
 * @returns Plain object with document data and ID
 */
export function docToData(doc: any) {
  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Convert Firestore query snapshot to array of objects
 * @param querySnapshot - Firestore query snapshot
 * @returns Array of plain objects with document data and IDs
 */
export function querySnapshotToArray(querySnapshot: any) {
  return querySnapshot.docs.map(docToData);
}
