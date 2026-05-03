// Script to check existing admin users in Firestore
// Run this in browser console when logged in

async function checkAdminUsers() {
  console.log('🔍 Checking for existing admin users...');
  
  try {
    // Import Firebase modules (these should be available in the browser console)
    const { getAuth } = await import('firebase/auth');
    const { collection, getDocs, query, where, getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./src/app/lib/firebase.js');
    
    console.log('🔍 Fetching all users from Firestore...');
    
    // Get all users from Firestore
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${usersSnapshot.size} users in Firestore:`);
    
    let adminUsers = [];
    let regularUsers = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 User: ${userData.email} | Role: ${userData.role} | UID: ${userData.uid}`);
      
      if (userData.role === 'admin') {
        adminUsers.push(userData);
      } else {
        regularUsers.push(userData);
      }
    });
    
    console.log('\n👑 ADMIN USERS:');
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (UID: ${user.uid})`);
      });
    }
    
    console.log('\n👥 REGULAR USERS:');
    if (regularUsers.length === 0) {
      console.log('❌ No regular users found');
    } else {
      regularUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (UID: ${user.uid})`);
      });
    }
    
    // Check current authenticated user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      console.log('\n🔐 CURRENTLY LOGGED IN USER:');
      console.log(`Email: ${currentUser.email}`);
      console.log(`UID: ${currentUser.uid}`);
      
      // Check if current user has admin document
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`Role: ${userData.role}`);
        console.log(`Has Admin Access: ${userData.role === 'admin' ? '✅ YES' : '❌ NO'}`);
      } else {
        console.log('❌ No Firestore document found for current user');
      }
    } else {
      console.log('\n❌ No user is currently logged in');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  }
}

// Auto-run the function
checkAdminUsers();
