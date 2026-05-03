// Script to create admin user document in Firestore
// Run this in the browser console when logged in as admin

async function createAdminUserDocument() {
  console.log('🔧 Creating admin user document...');
  
  try {
    // Import Firebase modules (these should be available in the browser console)
    const { getAuth } = await import('firebase/auth');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { auth, db } = await import('./src/app/lib/firebase.js');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user is currently logged in');
      return false;
    }
    
    console.log('🔧 Current user:', currentUser.email, 'UID:', currentUser.uid);
    
    // Create admin user document
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = {
      uid: currentUser.uid,
      email: currentUser.email,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    await setDoc(userRef, userDoc);
    console.log('✅ Admin user document created successfully!');
    console.log('📄 Document data:', userDoc);
    
    // Refresh the page to reload user context
    setTimeout(() => {
      console.log('🔄 Refreshing page to reload user context...');
      window.location.reload();
    }, 1000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating admin user document:', error);
    return false;
  }
}

// Auto-run the function
createAdminUserDocument();
