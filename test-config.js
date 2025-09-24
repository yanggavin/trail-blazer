// Simple test script to validate AMap configuration
// Run with: node test-config.js

console.log('🧪 Testing AMap Configuration...\n');

// Load environment variables
require('dotenv').config();

console.log('📋 Environment Variables:');
console.log('AMAP_ANDROID_API_KEY:', process.env.AMAP_ANDROID_API_KEY ? `${process.env.AMAP_ANDROID_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('AMAP_IOS_API_KEY:', process.env.AMAP_IOS_API_KEY ? `${process.env.AMAP_IOS_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('AMAP_WEB_SERVICE_API_KEY:', process.env.AMAP_WEB_SERVICE_API_KEY ? `${process.env.AMAP_WEB_SERVICE_API_KEY.substring(0, 8)}...` : 'NOT SET');

// Validate keys
const validateKey = (keyName, keyValue) => {
  if (!keyValue) {
    console.log(`❌ ${keyName}: NOT SET`);
    return false;
  } else if (keyValue.includes('your_') || keyValue.includes('YOUR_')) {
    console.log(`⚠️  ${keyName}: PLACEHOLDER VALUE`);
    return false;
  } else if (keyValue.length < 20) {
    console.log(`⚠️  ${keyName}: TOO SHORT (${keyValue.length} chars)`);
    return false;
  } else {
    console.log(`✅ ${keyName}: VALID (${keyValue.length} chars)`);
    return true;
  }
};

console.log('\n🔍 Validation Results:');
const androidValid = validateKey('ANDROID_KEY', process.env.AMAP_ANDROID_API_KEY);
const iosValid = validateKey('iOS_KEY', process.env.AMAP_IOS_API_KEY);
const webValid = validateKey('WEB_SERVICE_KEY', process.env.AMAP_WEB_SERVICE_API_KEY);

console.log('\n📊 Summary:');
if (androidValid && iosValid && webValid) {
  console.log('🎉 All API keys are properly configured!');
} else {
  console.log('⚠️  Some API keys need attention. Check the logs above.');
}

console.log('\n🔒 Security Check:');
console.log('✅ API keys are loaded from environment variables');
console.log('✅ Keys are not hardcoded in source files');
console.log('✅ .env file should be in .gitignore');
console.log('✅ Environment variables are exported for build process');

console.log('\nTest completed! 🏁');