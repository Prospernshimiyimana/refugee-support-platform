// Debug script to check why admin dashboard doesn't display
// Run this in browser console when logged in

async function debugDashboardAccess() {
  console.log('🔍 Debugging admin dashboard access...');
  
  try {
    // Check if we're on the dashboard page
    if (window.location.pathname !== '/dashboard') {
      console.log('❌ You are not on the dashboard page');
      console.log('📍 Current page:', window.location.pathname);
      console.log('💡 Navigate to: http://localhost:3000/dashboard');
      return;
    }
    
    // Check authentication state
    console.log('\n🔐 Checking authentication state...');
    
    // Try to access React context (this might not work directly in console)
    const authContextElement = document.querySelector('[data-auth-context]');
    if (authContextElement) {
      console.log('✅ Found auth context element');
    } else {
      console.log('❌ Cannot access React context directly');
    }
    
    // Check Firebase auth state
    const { getAuth } = await import('firebase/auth');
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./src/app/lib/firebase.js');
    
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user is logged in');
      console.log('💡 Please login first: http://localhost:3000/login');
      return;
    }
    
    console.log('✅ User is logged in:');
    console.log('   Email:', currentUser.email);
    console.log('   UID:', currentUser.uid);
    
    // Check user document in Firestore
    console.log('\n📋 Checking user document...');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ No user document found in Firestore');
      console.log('🔧 This is the problem! Creating user document...');
      
      // Create the user document
      await import('./src/app/lib/adminFix.ts').then(module => {
        return module.ensureCurrentUserDocument();
      }).then(result => {
        console.log('📄 User document creation result:', result);
        if (result.success) {
          console.log('✅ User document created with role:', result.role);
          console.log('🔄 Refresh the page to see the dashboard');
        }
      });
      
      return;
    }
    
    const userData = userDoc.data();
    console.log('✅ User document found:');
    console.log('   Email:', userData.email);
    console.log('   Role:', userData.role);
    console.log('   Is Admin:', userData.role === 'admin' ? '✅ YES' : '❌ NO');
    
    if (userData.role !== 'admin') {
      console.log('\n❌ User is not admin - this is why dashboard doesn\'t display');
      console.log('🔧 To make yourself admin, run:');
      console.log('   import("./src/app/lib/adminFix.ts").then(m => m.forceCreateAdminDocument())');
    } else {
      console.log('\n✅ User is admin - dashboard should display');
      console.log('🔧 If dashboard still doesn\'t show, check for:');
      console.log('   - JavaScript errors in console');
      console.log('   - Component rendering issues');
      console.log('   - Route protection problems');
    }
    
    // Check for any JavaScript errors
    console.log('\n🐛 Checking for JavaScript errors...');
    const errors = [];
    
    // Check console errors
    if (window.console && window.console.error) {
      console.log('💡 Check the browser console for any red error messages');
    }
    
    console.log('\n📊 Summary:');
    console.log('1. ✅ User logged in:', !!currentUser);
    console.log('2. ✅ User document exists:', userDoc.exists());
    console.log('3. ✅ User role:', userData.role);
    console.log('4. 🎯 Dashboard should display:', userData.role === 'admin');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    console.log('💡 Make sure Firebase is properly initialized');
  }
}

// Auto-run the debug function
debugDashboardAccess();
