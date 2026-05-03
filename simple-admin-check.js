// Simple admin check script - copy and paste into browser console
// Make sure you're logged into the application first

// Step 1: Check if you're logged in
const auth = window.firebase?.auth?.() || window.auth;
const currentUser = auth?.currentUser;

if (!currentUser) {
  console.log('❌ Please log in first, then run this script again');
  console.log('📍 Go to: http://localhost:3000/login');
} else {
  console.log('✅ Logged in as:', currentUser.email);
  console.log('🔑 UID:', currentUser.uid);
  
  // Step 2: Check if user document exists and role
  const db = window.firebase?.firestore?.getFirestore?.() || window.db;
  
  if (db) {
    // Import needed functions
    import('firebase/firestore').then(({ doc, getDoc, collection, getDocs }) => {
      // Check current user's role
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then((userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('📋 User Document Found:');
          console.log('   Email:', userData.email);
          console.log('   Role:', userData.role);
          console.log('   Admin Access:', userData.role === 'admin' ? '✅ YES' : '❌ NO');
        } else {
          console.log('❌ No user document found - this is the problem!');
          console.log('🔧 Run this to fix:');
          console.log('   import("./src/app/lib/adminFix.ts").then(m => m.forceCreateAdminDocument())');
        }
      });
      
      // Check all users
      const usersCollection = collection(db, 'users');
      getDocs(usersCollection).then((snapshot) => {
        console.log('\n📊 ALL USERS IN SYSTEM:');
        let adminCount = 0;
        
        snapshot.forEach((doc) => {
          const user = doc.data();
          console.log(`   ${user.email} - Role: ${user.role}`);
          if (user.role === 'admin') adminCount++;
        });
        
        console.log(`\n👑 Total Admin Users: ${adminCount}`);
        
        if (adminCount === 0) {
          console.log('❌ NO ADMIN USERS FOUND!');
          console.log('🔧 You need to create an admin user');
        }
      });
    }).catch(err => {
      console.log('❌ Error accessing Firebase:', err);
      console.log('💡 Make sure Firebase is properly initialized');
    });
  } else {
    console.log('❌ Firebase/Firestore not available');
  }
}
