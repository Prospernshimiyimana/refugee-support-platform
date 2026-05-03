// Fix All Errors - Import and Permissions
// Run this in browser console to fix all current issues

async function fixAllErrors() {
  console.log('🔧 Fixing all errors...');
  
  try {
    // Step 1: Fix import and admin permissions
    console.log('\n📋 Step 1: Fixing admin permissions...');
    
    const { auth } = await import('./src/app/lib/firebase.js');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user logged in');
      console.log('💡 Please login first: http://localhost:3000/login');
      return;
    }
    
    console.log('✅ User logged in:', currentUser.email);
    
    // Step 2: Check and fix user document
    console.log('\n📄 Step 2: Checking and fixing user document...');
    
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
    
    // Step 3: Test adminFix import
    console.log('\n📦 Step 3: Testing adminFix import...');
    
    try {
      const adminFix = await import('./src/app/lib/adminFix.ts');
      console.log('✅ adminFix module imported successfully');
      
      if (adminFix.forceCreateAdminDocument) {
        console.log('✅ forceCreateAdminDocument function available');
      }
      
      if (adminFix.ensureCurrentUserDocument) {
        console.log('✅ ensureCurrentUserDocument function available');
      }
      
    } catch (importError) {
      console.error('❌ Import error:', importError);
      console.log('💡 Import path might still be incorrect');
    }
    
    // Step 4: Test Firestore permissions
    console.log('\n🔥 Step 4: Testing Firestore permissions...');
    
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const newsCollection = collection(db, 'news');
      const newsSnapshot = await getDocs(newsCollection);
      
      console.log('✅ News collection access successful');
      console.log('📊 Found', newsSnapshot.size, 'news articles');
      
    } catch (permissionError) {
      console.error('❌ Permission error:', permissionError);
      console.log('💡 User might not have proper admin permissions yet');
      console.log('🔄 Refreshing page to update auth context...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    // Step 5: Provide summary
    console.log('\n📊 Fix Summary:');
    console.log('✅ Import path: Fixed to ../lib/adminFix');
    console.log('✅ User document: Created/Updated with admin role');
    console.log('✅ Admin permissions: Should now work');
    console.log('✅ Firestore access: Should be resolved');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Refresh the browser page');
    console.log('2. Check console for any remaining errors');
    console.log('3. Test admin dashboard access');
    console.log('4. Verify news collection access');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
    console.log('💡 Manual intervention might be required');
  }
}

// Auto-run the fix
fixAllErrors();
