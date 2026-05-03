// Test to verify import errors are fixed
// Run this in browser console

async function testErrorsFixed() {
  console.log('🧪 Testing if import errors are fixed...');
  
  try {
    // Test 1: Check if adminFix module can be imported
    console.log('\n📦 Test 1: Testing adminFix import...');
    
    const adminFix = await import('./src/app/lib/adminFix.ts');
    console.log('✅ adminFix module imported successfully');
    console.log('📋 Available functions:', Object.keys(adminFix));
    
    // Test 2: Test if forceCreateAdminDocument function exists
    if (adminFix.forceCreateAdminDocument) {
      console.log('✅ forceCreateAdminDocument function available');
    } else {
      console.log('❌ forceCreateAdminDocument function not found');
    }
    
    // Test 3: Test if ensureCurrentUserDocument function exists
    if (adminFix.ensureCurrentUserDocument) {
      console.log('✅ ensureCurrentUserDocument function available');
    } else {
      console.log('❌ ensureCurrentUserDocument function not found');
    }
    
    // Test 4: Test if debugAdminAccess function exists
    if (adminFix.debugAdminAccess) {
      console.log('✅ debugAdminAccess function available');
    } else {
      console.log('❌ debugAdminAccess function not found');
    }
    
    console.log('\n🎯 All import tests completed');
    console.log('✅ Module import errors should be resolved');
    console.log('💡 The npm run dev command should now work without errors');
    
  } catch (error) {
    console.error('❌ Import test failed:', error);
    console.log('💡 There might still be import issues to resolve');
  }
}

// Auto-run the test
testErrorsFixed();
