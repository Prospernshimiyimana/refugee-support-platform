import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  onSnapshot,
  Unsubscribe,
  Query,
  CollectionReference,
  WhereFilterOp,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Direct Firestore operations
 * Firebase rules are the ONLY source of truth for permissions
 */

// Direct collection operations without any permission pre-checks
export const safeGetDocs = async (collectionName: string, queryFn?: (ref: CollectionReference) => Query) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const collectionRef = collection(db, collectionName);
  const finalQuery = queryFn ? queryFn(collectionRef) : collectionRef;
  return await getDocs(finalQuery);
};

export const safeGetDoc = async (collectionName: string, docId: string) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, collectionName, docId);
  return await getDoc(docRef);
};

export const safeAddDoc = async (collectionName: string, data: Record<string, unknown>) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const collectionRef = collection(db, collectionName);
  return await addDoc(collectionRef, data);
};

export const safeUpdateDoc = async (collectionName: string, docId: string, data: Record<string, unknown>) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, collectionName, docId);
  return await updateDoc(docRef, data);
};

export const safeDeleteDoc = async (collectionName: string, docId: string) => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  const docRef = doc(db, collectionName, docId);
  return await deleteDoc(docRef);
};

// Direct real-time listeners without permission pre-checks
export const safeOnSnapshot = (
  collectionName: string,
  callback: (snapshot: QuerySnapshot) => void,
  queryFn?: (ref: CollectionReference) => Query,
  errorCallback?: (error: unknown) => void
): Unsubscribe => {
  if (!db) {
    const error = new Error('Firestore is not initialized');
    console.error(`🔥 SafeFirestore: Cannot create listener for ${collectionName}:`, error);
    if (errorCallback) {
      errorCallback(error);
    }
    return () => {}; // Return no-op unsubscribe function
  }
  
  const collectionRef = collection(db, collectionName);
  const finalQuery = queryFn ? queryFn(collectionRef) : collectionRef;
  
  return onSnapshot(finalQuery, callback, (error) => {
    console.error(`🔥 SafeFirestore: Listener error for ${collectionName}:`, error);
    if (errorCallback) {
      errorCallback(error);
    }
  });
};

// Query builders
export const safeQuery = {
  where: (field: string, operator: WhereFilterOp, value: unknown) => (ref: CollectionReference | Query) => query(ref, where(field, operator, value)),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => (ref: CollectionReference | Query) => query(ref, orderBy(field, direction)),
  limit: (count: number) => (ref: CollectionReference | Query) => query(ref, limit(count)),
  combine: (...queryFns: ((ref: CollectionReference | Query) => Query)[]) => (ref: CollectionReference) => {
    let result: CollectionReference | Query = ref;
    for (const fn of queryFns) {
      result = fn(result);
    }
    return result as Query;
  }
};

// Helper functions for common operations
export const safeGetAllDocuments = async (collectionName: string, options?: {
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  where?: { field: string; operator: WhereFilterOp; value: unknown };
}) => {
  let queryFn: ((ref: CollectionReference) => Query) | undefined = undefined;
  
  if (options) {
    const queryFns = [];
    
    if (options.where) {
      queryFns.push(safeQuery.where(options.where.field, options.where.operator, options.where.value));
    }
    
    if (options.orderBy) {
      queryFns.push(safeQuery.orderBy(options.orderBy.field, options.orderBy.direction));
    }
    
    if (options.limit) {
      queryFns.push(safeQuery.limit(options.limit));
    }
    
    if (queryFns.length > 0) {
      queryFn = safeQuery.combine(...queryFns);
    }
  }
  
  const snapshot = await safeGetDocs(collectionName, queryFn);
  return snapshot?.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })) || [];
};

export const safeGetDocumentById = async (collectionName: string, docId: string) => {
  const docSnap = await safeGetDoc(collectionName, docId);
  return docSnap?.exists() ? { id: docSnap.id, ...(docSnap.data() as Record<string, unknown>) } : null;
};
