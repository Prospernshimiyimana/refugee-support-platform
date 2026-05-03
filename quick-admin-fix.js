// Quick Admin Dashboard Fix - Run this in browser console
// This will immediately fix admin access and restore dashboard

async function quickAdminFix() {
  console.log('🚀 Quick Admin Dashboard Fix Starting...');
  
  try {
    // Check if user is logged in
    const { auth } = await import('./src/app/lib/firebase.js');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ Please login first: http://localhost:3000/login');
      return;
    }
    
    console.log('✅ User logged in:', currentUser.email);
    
    // Import admin fix utilities
    const adminFix = await import('./src/app/lib/adminFix.ts');
    
    // Step 1: Ensure user document exists
    console.log('📄 Ensuring user document exists...');
    const docResult = await adminFix.ensureCurrentUserDocument();
    console.log('📄 Document result:', docResult);
    
    // Step 2: Force admin role (for development/testing)
    console.log('👑 Setting admin role...');
    const adminResult = await adminFix.forceCreateAdminDocument();
    console.log('👑 Admin result:', adminResult);
    
    if (adminResult.success) {
      console.log('✅ Admin access granted!');
      console.log('🔄 Refreshing page to update auth context...');
      
      // Refresh the page to reload user context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      console.log('❌ Admin setup failed:', adminResult.error);
    }
    
  } catch (error) {
    console.error('❌ Quick fix error:', error);
    
    // Fallback: Manual admin document creation
    try {
      console.log('🔧 Trying fallback admin creation...');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { auth, db } = await import('./src/app/lib/firebase.js');
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          role: 'admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log('✅ Fallback admin document created!');
        console.log('🔄 Refreshing page...');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
}

// Auto-run the fix
quickAdminFix();
