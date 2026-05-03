import { doc, setDoc, getDoc, collection, getDocs, query, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase';
import { db } from './firebase';

export interface UserDocument {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

export const createUserDocument = async (user: {
  uid: string;
  email: string;
}): Promise<void> => {
  try {
    console.log('🔥 UserService: Creating user document for UID:', user.uid, 'Email:', user.email);
    
    if (!db) {
      console.error('🔥 UserService: Database not available');
      throw new Error('Database not available');
    }
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc: UserDocument = {
      uid: user.uid,
      email: user.email,
      role: 'user', // Default role for new signups
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    await setDoc(userRef, userDoc);
    console.log('🔥 UserService: User document created successfully');
  } catch (error) {
    console.error('🔥 UserService: Error creating user document:', error);
    throw error;
  }
};

export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
  try {
    console.log('🔥 UserService: Fetching user document for UID:', uid);
    
    if (!db) {
      console.error('🔥 UserService: Database not available');
      return null;
    }
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserDocument;
      console.log('🔥 UserService: User document found:', userData);
      return userData;
    } else {
      console.log('🔥 UserService: User document not found for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('🔥 UserService: Error fetching user document:', error);
    throw error;
  }
};

export const getCurrentUserDocument = async (): Promise<UserDocument | null> => {
  if (!auth) {
    console.warn('🔥 UserService: Firebase Auth not initialized');
    return null;
  }
  
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.uid) {
    return null;
  }
  
  return await getUserDocument(currentUser.uid);
};

export const getAllUsers = async (): Promise<UserDocument[]> => {
  try {
    if (!db) {
      console.error('🔥 UserService: Database not available');
      throw new Error('Database not available');
    }
    
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection);
    const querySnapshot = await getDocs(usersQuery);
    
    const users: UserDocument[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserDocument);
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'user'): Promise<void> => {
  try {
    if (!db) {
      console.error('🔥 UserService: Database not available');
      throw new Error('Database not available');
    }
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
    console.log(`User role updated successfully for uid: ${uid}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getUsersCount = async (): Promise<number> => {
  try {
    if (!auth) {
      console.warn('🔥 UserService: Firebase Auth not initialized');
      return 0;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('User not authenticated, cannot fetch users count');
      return 0;
    }
    
    if (!db) {
      console.error('🔥 UserService: Database not available');
      return 0;
    }
    
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection);
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting users count:', error);
    return 0;
  }
};

export const getCasesCount = async (): Promise<number> => {
  try {
    if (!auth) {
      console.warn('🔥 UserService: Firebase Auth not initialized');
      return 0;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('User not authenticated, cannot fetch cases count');
      return 0;
    }
    
    if (!db) {
      console.error('🔥 UserService: Database not available');
      return 0;
    }
    
    const casesCollection = collection(db, 'cases');
    const casesQuery = query(casesCollection);
    const querySnapshot = await getDocs(casesQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting cases count:', error);
    return 0;
  }
};

export const getNewsCount = async (): Promise<number> => {
  try {
    if (!auth) {
      console.warn('🔥 UserService: Firebase Auth not initialized');
      return 0;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('🔥 UserService: User not authenticated, cannot fetch news count');
      return 0;
    }
    
    console.log('🔥 UserService: Fetching news count for authenticated user:', currentUser.uid);
    
    if (!db) {
      console.error('🔥 UserService: Database not available');
      return 0;
    }
    
    const newsCollection = collection(db, 'news');
    // Filter by published status to avoid permission issues
    const newsQuery = query(newsCollection, where('status', '==', 'published'));
    const querySnapshot = await getDocs(newsQuery);
    
    console.log(`🔥 UserService: Successfully fetched news count: ${querySnapshot.size}`);
    return querySnapshot.size;
  } catch (error) {
    console.error('🔥 UserService: Error getting news count:', error);
    
    // Handle permission errors gracefully
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.warn('🔥 UserService: Permission denied for news count, returning 0');
      return 0;
    }
    
    return 0;
  }
};

export const getDashboardStats = async () => {
  try {
    if (!auth) {
      console.warn('🔥 UserService: Firebase Auth not initialized');
      return {
        usersCount: 0,
        casesCount: 0,
        newsCount: 0
      };
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('User not authenticated, cannot fetch dashboard stats');
      return {
        usersCount: 0,
        casesCount: 0,
        newsCount: 0
      };
    }
    
    const [usersCount, casesCount, newsCount] = await Promise.all([
      getUsersCount(),
      getCasesCount(),
      getNewsCount()
    ]);
    
    return {
      usersCount,
      casesCount,
      newsCount
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      usersCount: 0,
      casesCount: 0,
      newsCount: 0
    };
  }
};
