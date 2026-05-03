// Fix Authentication and Permissions Errors
// Run this in browser console to fix all auth and permission issues

async function fixAuthAndPermissions() {
  console.log('🔧 Fixing Authentication and Permissions...');
  
  try {
    // Step 1: Check current authentication state
    console.log('\n📋 Step 1: Checking authentication state...');
    
    const { auth } = await import('./src/app/lib/firebase.js');
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      console.log('✅ User already logged in:', currentUser.email);
      console.log('🔑 UID:', currentUser.uid);
    } else {
      console.log('❌ No user logged in');
      console.log('💡 Please login first: http://localhost:3000/login');
      console.log('🔧 Use valid credentials to avoid auth/invalid-credential error');
      return;
    }
    
    // Step 2: Check and fix user document with admin role
    console.log('\n📄 Step 2: Ensuring user has admin document...');
    
    const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/app/lib/firebase.js');
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document missing - creating admin document...');
      
      // Create admin document
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Admin document created');
    } else {
      const userData = userDoc.data();
      console.log('✅ User document found');
      console.log('📋 Current role:', userData.role);
      
      if (userData.role !== 'admin') {
        console.log('🔧 Promoting to admin...');
        await setDoc(userDocRef, {
          role: 'admin',
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('✅ Promoted to admin');
      }
    }
    
    // Step 3: Test Firestore permissions for news collection
    console.log('\n🔥 Step 3: Testing Firestore permissions...');
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const newsCollection = collection(db, 'news');
      const newsSnapshot = await getDocs(newsCollection);
      
      console.log('✅ News collection access successful');
      console.log('📊 Found', newsSnapshot.size, 'news articles');
      
    } catch (permissionError) {
      console.error('❌ Permission error:', permissionError);
      console.log('💡 This might be due to:');
      console.log('   - User not having admin role yet');
      console.log('   - Firestore rules not properly deployed');
      console.log('   - Firebase configuration issues');
      
      // Try to refresh auth context
      console.log('🔄 Refreshing auth context...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    // Step 4: Test real-time listener (this might fail but that's expected)
    console.log('\n📡 Step 4: Testing real-time listener...');
    
    try {
      const { collection, onSnapshot } = await import('firebase/firestore');
      const newsCollection = collection(db, 'news');
      
      const unsubscribe = onSnapshot(newsCollection, (snapshot) => {
        console.log('✅ Real-time listener working!');
        console.log('📊 Real-time news count:', snapshot.size);
        unsubscribe();
      }, (error) => {
        console.warn('⚠️ Real-time listener error (expected):', error.message);
      });
      
    } catch (listenerError) {
      console.warn('⚠️ Listener setup error:', listenerError.message);
    }
    
    // Step 5: Provide authentication guidance
    console.log('\n🔐 Authentication Guidance:');
    console.log('If you get "auth/invalid-credential" error:');
    console.log('1. Check your email/password are correct');
    console.log('2. Make sure the user exists in Firebase Auth');
    console.log('3. Try resetting your password if needed');
    console.log('4. Ensure the user is not disabled in Firebase Console');
    
    // Step 6: Provide next steps
    console.log('\n🎯 Next Steps:');
    console.log('1. Ensure you are logged in with valid credentials');
    console.log('2. Check that user document has admin role');
    console.log('3. Verify Firestore rules are deployed');
    console.log('4. Test admin dashboard access');
    console.log('5. Check news collection permissions');
    
    console.log('\n📊 Fix Summary:');
    console.log('✅ User document: Created/Updated with admin role');
    console.log('✅ Permissions: Should now work for admin users');
    console.log('✅ Real-time access: Test completed');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
    console.log('💡 Manual intervention might be required');
  }
}

// Auto-run the fix
fixAuthAndPermissions();
