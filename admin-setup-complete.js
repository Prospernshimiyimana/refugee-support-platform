// Complete Admin Setup - Check existing admins and create if needed
// Run this in browser console

async function completeAdminSetup() {
  console.log('🚀 Starting complete admin setup...');
  
  try {
    // Step 1: Check if admin accounts already exist
    console.log('\n📋 Step 1: Checking existing admin accounts...');
    
    const { doc, getDocs, collection, getDoc } = await import('firebase/firestore');
    const { auth, db } = await import('./src/app/lib/firebase.js');
    
    // Check current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No user is logged in');
      console.log('💡 Please login first: http://localhost:3000/login');
      console.log('🔄 Then run this script again');
      return;
    }
    
    console.log('✅ Current user:', currentUser.email);
    
    // Check all users for admin role
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
    
    console.log(`📊 Found ${adminUsers.length} admin users:`);
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the system');
      
      // Step 2: Create admin account
      console.log('\n👑 Step 2: Creating admin account...');
      
      // Import admin fix utilities
      const adminFix = await import('./src/app/lib/adminFix.ts');
      
      // Create admin document for current user
      console.log('📄 Creating admin document for:', currentUser.email);
      const result = await adminFix.forceCreateAdminDocument();
      
      if (result.success) {
        console.log('✅ Admin account created successfully!');
        console.log('📧 Email:', currentUser.email);
        console.log('🔑 Password: [Use your existing password]');
        console.log('👑 Role: admin');
        
        // Step 3: Verify and provide access info
        console.log('\n🎯 Step 3: Dashboard Access Information:');
        console.log('📍 Dashboard URL: http://localhost:3000/dashboard');
        console.log('📧 Login Email:', currentUser.email);
        console.log('🔑 Password: [Your current login password]');
        console.log('👑 Admin Role: ✅ Confirmed');
        
        console.log('\n🔄 Refreshing page to update permissions...');
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/dashboard';
        }, 2000);
        
      } else {
        console.log('❌ Failed to create admin account:', result.error);
        
        // Fallback creation
        console.log('🔧 Trying fallback admin creation...');
        try {
          const { setDoc, serverTimestamp } = await import('firebase/firestore');
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            role: 'admin',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          console.log('✅ Fallback admin creation successful!');
          console.log('📧 Email:', currentUser.email);
          console.log('🔑 Password: [Your existing password]');
          console.log('📍 Go to: http://localhost:3000/dashboard');
          
          setTimeout(() => {
            window.location.href = 'http://localhost:3000/dashboard';
          }, 2000);
          
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
    } else {
      console.log('✅ Admin users already exist:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
      });
      
      // Check if current user is admin
      const currentAdmin = adminUsers.find(admin => admin.uid === currentUser.uid);
      if (currentAdmin) {
        console.log('\n🎉 You already have admin access!');
        console.log('📧 Email:', currentUser.email);
        console.log('🔑 Password: [Your current password]');
        console.log('📍 Dashboard URL: http://localhost:3000/dashboard');
        
        console.log('\n🔄 Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/dashboard';
        }, 2000);
        
      } else {
        console.log('\n❌ You are not currently an admin');
        console.log('💡 To make yourself admin, run:');
        console.log('   import("./src/app/lib/adminFix.ts").then(m => m.forceCreateAdminDocument())');
      }
    }
    
  } catch (error) {
    console.error('❌ Admin setup error:', error);
    console.log('💡 Make sure you are logged in and Firebase is working');
  }
}

// Auto-run the complete setup
completeAdminSetup();
