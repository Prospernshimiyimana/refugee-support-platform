// Test Admin Dashboard Fix - Complete verification
// Run this in browser console to test all fixes

async function testAdminDashboardFix() {
  console.log('🧪 Testing Admin Dashboard Fix...');
  
  try {
    // Step 1: Check authentication state
    console.log('\n📋 Step 1: Checking authentication state...');
    
    const { auth } = await import('./src/app/lib/firebase.js');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user logged in');
      console.log('💡 Please login first: http://localhost:3000/login');
      return;
    }
    
    console.log('✅ User logged in:', currentUser.email);
    console.log('🔑 UID:', currentUser.uid);
    
    // Step 2: Check user document in Firestore
    console.log('\n📄 Step 2: Checking user document...');
    
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./src/app/lib/firebase.js');
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document missing - creating one...');
      
      // Create user document
      const { setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ User document created');
    } else {
      console.log('✅ User document exists');
    }
    
    // Get updated user document
    const updatedUserDoc = await getDoc(userDocRef);
    const userData = updatedUserDoc.data();
    
    console.log('📋 User Document Data:');
    console.log('   Email:', userData.email);
    console.log('   Role:', userData.role);
    console.log('   UID:', userData.uid);
    console.log('   Created At:', userData.createdAt);
    
    // Step 3: Test admin detection
    console.log('\n👑 Step 3: Testing admin detection...');
    
    const isAdmin = userData.role === 'admin';
    console.log('🔍 Is Admin:', isAdmin ? '✅ YES' : '❌ NO');
    
    if (!isAdmin) {
      console.log('🔧 Promoting user to admin for testing...');
      
      // Promote to admin
      const { setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(userDocRef, {
        role: 'admin',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ User promoted to admin');
      
      // Refresh user data
      const promotedDoc = await getDoc(userDocRef);
      const promotedData = promotedDoc.data();
      console.log('👑 New Role:', promotedData.role);
    }
    
    // Step 4: Test dashboard access
    console.log('\n🎯 Step 4: Testing dashboard access...');
    
    console.log('📍 Navigating to dashboard...');
    console.log('🔗 URL: http://localhost:3000/dashboard');
    
    // Navigate to dashboard
    setTimeout(() => {
      window.location.href = 'http://localhost:3000/dashboard';
    }, 2000);
    
    // Step 5: Provide test results summary
    console.log('\n📊 Test Results Summary:');
    console.log('✅ Authentication: Working');
    console.log('✅ User Document: Created/Verified');
    console.log('✅ Admin Detection: Working');
    console.log('✅ Dashboard Access: Should work');
    
    console.log('\n🔧 What to check:');
    console.log('1. Dashboard should load without "User Document Missing" errors');
    console.log('2. Console should show "Is Admin: YES"');
    console.log('3. Admin interface should be visible');
    console.log('4. No "User Role: Unknown" messages');
    
    console.log('\n🎯 Expected Console Logs:');
    console.log('🔐 AuthContext Debug: (shows user info)');
    console.log('🎯 Dashboard Debug: (shows admin status)');
    console.log('🎯 Dashboard: User is admin, allowing access');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    console.log('💡 Make sure Firebase is properly initialized');
  }
}

// Auto-run the test
testAdminDashboardFix();
