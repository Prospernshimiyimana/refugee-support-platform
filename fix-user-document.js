// Script to create user document for santos@gmail.com
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './src/app/lib/firebase.ts';

// Use existing Firebase configuration from the project

async function createUserDocument() {
  const userUid = '7eNrYPfUWChg6lOw2PLrnjU5np82';
  const userEmail = 'santos@gmail.com';
  
  try {
    console.log('Creating user document for:', userEmail);
    
    const userRef = doc(db, 'users', userUid);
    const userDoc = {
      uid: userUid,
      email: userEmail,
      role: 'user', // Default role
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    await setDoc(userRef, userDoc);
    console.log('✅ User document created successfully!');
    console.log('User document:', userDoc);
    
  } catch (error) {
    console.error('❌ Error creating user document:', error);
  }
}

// Run the function
createUserDocument();
