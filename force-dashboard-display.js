// Force Dashboard Display - Complete fix for dashboard not showing
// Run this in browser console after admin account creation

async function forceDashboardDisplay() {
  console.log('🚀 Forcing dashboard display...');
  
  try {
    // Step 1: Verify admin status
    console.log('\n📋 Step 1: Verifying admin status...');
    
    const { doc, getDoc } = await import('firebase/firestore');
    const { auth, db } = await import('./src/app/lib/firebase.js');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No user logged in');
      console.log('💡 Please login first: http://localhost:3000/login');
      return;
    }
    
    console.log('✅ Current user:', currentUser.email);
    
    // Check user document
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ No user document found - creating admin document...');
      
      // Force create admin document
      const { setDoc, serverTimestamp } = await import('firebase/firestore');
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
      console.log('📋 Current role:', userData.role);
      
      if (userData.role !== 'admin') {
        console.log('🔧 Updating role to admin...');
        const { setDoc, serverTimestamp } = await import('firebase/firestore');
        await setDoc(userDocRef, {
          role: 'admin',
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('✅ Role updated to admin');
      }
    }
    
    // Step 2: Force refresh auth context
    console.log('\n🔄 Step 2: Refreshing auth context...');
    
    // Clear any cached auth state
    if (window.location.reload) {
      console.log('🔄 Reloading page to refresh auth context...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    // Step 3: Navigate to dashboard
    setTimeout(() => {
      console.log('\n📍 Step 3: Navigating to dashboard...');
      console.log('🎯 Dashboard URL: http://localhost:3000/dashboard');
      
      if (window.location.pathname !== '/dashboard') {
        window.location.href = 'http://localhost:3000/dashboard';
      } else {
        console.log('✅ Already on dashboard page');
        console.log('💡 If dashboard still doesn\'t show, check for JavaScript errors');
        console.log('💡 Also check if there are any component rendering issues');
      }
    }, 2000);
    
    // Step 4: Provide manual access info
    console.log('\n📧 Manual Access Information:');
    console.log('🔑 Email:', currentUser.email);
    console.log('🔑 Password: [Your existing login password]');
    console.log('👑 Role: admin');
    console.log('📍 Dashboard: http://localhost:3000/dashboard');
    
    console.log('\n🔧 If dashboard still doesn\'t display:');
    console.log('1. Open browser console (F12)');
    console.log('2. Check for any red error messages');
    console.log('3. Clear browser cache and cookies');
    console.log('4. Try refreshing the page again');
    console.log('5. Make sure you\'re logged in as admin');
    
  } catch (error) {
    console.error('❌ Force dashboard display error:', error);
    
    // Fallback: Manual navigation
    console.log('\n🔧 Fallback: Manual navigation');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Login with your credentials');
    console.log('3. Go to: http://localhost:3000/dashboard');
    console.log('4. If still blank, check browser console for errors');
  }
}

// Auto-run the force display
forceDashboardDisplay();
