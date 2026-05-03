/**
 * Admin User Document Fix Utility
 * Ensures admin users have proper Firestore documents with correct roles
 */

import { auth } from './firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { createUserDocument, getUserDocument } from './userService';

/**
 * Ensure current user has a proper Firestore document
 * Creates admin document if user is admin but document is missing
 */
export async function ensureCurrentUserDocument(): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    if (!auth) {
      return { success: false, error: 'Firebase Auth not initialized' };
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    console.log('🔧 AdminFix: Checking user document for:', currentUser.email);

    // Check if user document exists
    let userDoc = await getUserDocument(currentUser.uid);
    
    if (!userDoc) {
      console.log('🔧 AdminFix: User document missing, creating new one...');
      
      // Create basic user document
      await createUserDocument({
        uid: currentUser.uid,
        email: currentUser.email || ''
      });
      
      // Get the created document
      userDoc = await getUserDocument(currentUser.uid);
      
      if (!userDoc) {
        throw new Error('Failed to create user document');
      }
    }

    console.log('🔧 AdminFix: User document found:', userDoc);
    return { success: true, role: userDoc.role };
    
  } catch (error) {
    console.error('🔧 AdminFix: Error ensuring user document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Force create admin document for current user
 * Use this when you know the current user should be admin but document is missing/wrong
 */
export async function forceCreateAdminDocument(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth) {
      return { success: false, error: 'Firebase Auth not initialized' };
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    console.log('🔧 AdminFix: Force creating admin document for:', currentUser.email);

    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const adminDoc = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };

    await setDoc(userRef, adminDoc, { merge: true });
    console.log('✅ AdminFix: Admin document created successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('🔧 AdminFix: Error force creating admin document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check and fix admin access issues
 * This function can be called from browser console to debug admin access
 */
export async function debugAdminAccess(): Promise<void> {
  console.log('🔍 Starting admin access debug...');
  
  try {
    if (!auth) {
      console.log('❌ Firebase Auth not initialized');
      return;
    }
    
    const currentUser = auth.currentUser;
    console.log('🔍 Current user:', currentUser?.email, 'UID:', currentUser?.uid);
    
    if (!currentUser) {
      console.log('❌ No user logged in');
      return;
    }

    // Check user document
    const userDoc = await getUserDocument(currentUser.uid);
    console.log('🔍 User document:', userDoc);
    
    if (!userDoc) {
      console.log('❌ User document missing');
      const result = await ensureCurrentUserDocument();
      console.log('🔧 Document creation result:', result);
    } else {
      console.log('✅ User document exists with role:', userDoc.role);
      
      if (userDoc.role !== 'admin') {
        console.log('⚠️ User is not admin, but should be. Force updating...');
        await forceCreateAdminDocument();
      }
    }
    
  } catch (error) {
    console.error('🔍 Debug error:', error);
  }
}
