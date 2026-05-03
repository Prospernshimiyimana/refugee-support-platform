// Check existing admin users and credentials
// Run this in browser console when logged in

async function checkAdminCredentials() {
  console.log('🔍 Checking admin credentials...');
  
  try {
    const { doc, getDocs, collection, getDoc } = await import('firebase/firestore');
    const { auth, db } = await import('./src/app/lib/firebase.js');
    
    // Check current logged in user
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('✅ Currently logged in as:', currentUser.email);
      
      // Check if this user is admin
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📋 Your role:', userData.role);
        console.log('👑 Admin access:', userData.role === 'admin' ? '✅ YES' : '❌ NO');
        
        if (userData.role === 'admin') {
          console.log('🎉 You already have admin access!');
          console.log('📍 Go to: http://localhost:3000/dashboard');
        }
      }
    }
    
    // Check all admin users in the system
    console.log('\n📊 All admin users in the system:');
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    let adminUsers = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'admin') {
        adminUsers.push({
          email: userData.email,
          uid: userData.uid,
          role: userData.role
        });
      }
    });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the system');
      console.log('🔧 You need to create an admin user');
    } else {
      console.log('✅ Found admin users:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email} (UID: ${admin.uid})`);
      });
      
      console.log('\n💡 To use any of these admin accounts:');
      console.log('1. Go to: http://localhost:3000/login');
      console.log('2. Use the email listed above');
      console.log('3. If you don\'t know the password, you may need to reset it');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin credentials:', error);
  }
}

// Auto-run the check
checkAdminCredentials();
