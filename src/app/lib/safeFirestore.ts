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
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { permissionGuard } from './permissionGuard';

/**
 * Safe Firestore operations with comprehensive permission checking
 * Prevents all unauthorized requests and provides detailed logging
 */

// Safe collection operations
export const safeGetDocs = async (collectionName: string, queryFn?: any) => {
  return permissionGuard.withPermissionCheck(
    collectionName,
    'list',
    undefined,
    async () => {
      const collectionRef = collection(db, collectionName);
      const finalQuery = queryFn ? queryFn(collectionRef) : collectionRef;
      return await getDocs(finalQuery);
    }
  );
};

export const safeGetDoc = async (collectionName: string, docId: string) => {
  return permissionGuard.withPermissionCheck(
    collectionName,
    'read',
    docId,
    async () => {
      const docRef = doc(db, collectionName, docId);
      return await getDoc(docRef);
    }
  );
};

export const safeAddDoc = async (collectionName: string, data: any) => {
  return permissionGuard.withPermissionCheck(
    collectionName,
    'create',
    undefined,
    async () => {
      const collectionRef = collection(db, collectionName);
      return await addDoc(collectionRef, data);
    }
  );
};

export const safeUpdateDoc = async (collectionName: string, docId: string, data: any) => {
  return permissionGuard.withPermissionCheck(
    collectionName,
    'update',
    docId,
    async () => {
      const docRef = doc(db, collectionName, docId);
      return await updateDoc(docRef, data);
    }
  );
};

export const safeDeleteDoc = async (collectionName: string, docId: string) => {
  return permissionGuard.withPermissionCheck(
    collectionName,
    'delete',
    docId,
    async () => {
      const docRef = doc(db, collectionName, docId);
      return await deleteDoc(docRef);
    }
  );
};

// Safe real-time listeners
export const safeOnSnapshot = (
  collectionName: string,
  callback: (snapshot: any) => void,
  queryFn?: any,
  errorCallback?: (error: any) => void
): Unsubscribe => {
  // Check permissions before setting up listener
  permissionGuard.testPermission(collectionName, 'list', undefined)
    .then(permissionResult => {
      if (!permissionResult.allowed) {
        console.error(`🔒 SafeFirestore: Cannot set up listener for ${collectionName} - ${permissionResult.reason}`);
        if (errorCallback) {
          errorCallback(new Error(`Permission denied: ${permissionResult.reason}`));
        }
        return;
      }
      
      console.log(`🔒 SafeFirestore: Setting up listener for ${collectionName}`);
    })
    .catch(error => {
      console.error(`🔒 SafeFirestore: Permission test failed for ${collectionName}:`, error);
      if (errorCallback) {
        errorCallback(error);
      }
    });

  // Set up the actual listener
  const collectionRef = collection(db, collectionName);
  const finalQuery = queryFn ? queryFn(collectionRef) : collectionRef;
  
  return onSnapshot(finalQuery, callback, (error) => {
    console.error(`🔒 SafeFirestore: Listener error for ${collectionName}:`, error);
    if (errorCallback) {
      errorCallback(error);
    }
  });
};

// Safe query builders
export const safeQuery = {
  where: (field: string, operator: any, value: any) => (ref: any) => query(ref, where(field, operator, value)),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => (ref: any) => query(ref, orderBy(field, direction)),
  limit: (count: number) => (ref: any) => query(ref, limit(count)),
  combine: (...queryFns: any[]) => (ref: any) => queryFns.reduce((acc, fn) => fn(acc), ref)
};

// Helper functions for common operations
export const safeGetAllDocuments = async (collectionName: string, options?: {
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  where?: { field: string; operator: any; value: any };
}) => {
  let queryFn: any = undefined;
  
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
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));
};

export const safeGetDocumentById = async (collectionName: string, docId: string) => {
  const docSnap = await safeGetDoc(collectionName, docId);
  return docSnap.exists() ? { id: docSnap.id, ...(docSnap.data() as Record<string, any>) } : null;
};

// Permission checking utilities
export const checkUserCanRead = async (collectionName: string, docId?: string) => {
  const result = await permissionGuard.testPermission(collectionName, 'read', docId);
  return result.allowed;
};

export const checkUserCanWrite = async (collectionName: string, docId?: string) => {
  const result = await permissionGuard.testPermission(collectionName, 'write', docId);
  return result.allowed;
};

export const checkUserCanCreate = async (collectionName: string) => {
  const result = await permissionGuard.testPermission(collectionName, 'create', undefined);
  return result.allowed;
};

export const checkUserCanDelete = async (collectionName: string, docId: string) => {
  const result = await permissionGuard.testPermission(collectionName, 'delete', docId);
  return result.allowed;
};

// User role utilities
export const getCurrentUserRole = async () => {
  const auth = permissionGuard.isUserAuthenticated();
  if (!auth.authenticated) {
    return null;
  }
  
  if (!auth.uid) {
    return null;
  }
  const roleResult = await permissionGuard.getUserRole(auth.uid);
  return roleResult.role;
};

export const isCurrentUserAdmin = async () => {
  const role = await getCurrentUserRole();
  return role === 'admin';
};

// Clear permission cache (useful after role changes)
export const clearPermissionCache = () => {
  permissionGuard.clearCache();
};
