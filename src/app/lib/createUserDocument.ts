import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Create a user document for the authenticated user
 * This is a temporary fix for the missing user document issue
 */
export const createUserDocumentForUser = async (uid: string, email: string, role: 'admin' | 'user' = 'user') => {
  try {
    console.log('🔧 Creating user document for:', email, 'with role:', role);
    
    const userRef = doc(db, 'users', uid);
    const userDoc = {
      uid,
      email,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    await setDoc(userRef, userDoc);
    console.log('✅ User document created successfully!');
    return { success: true, userDoc };
    
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    return { success: false, error };
  }
};

// Auto-create document for the specific user that's having issues
export const fixSantosUser = async () => {
  return await createUserDocumentForUser(
    '7eNrYPfUWChg6lOw2PLrnjU5np82',
    'santos@gmail.com',
    'user' // You can change this to 'admin' if needed
  );
};
