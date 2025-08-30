// Debug script for Spotify Tab Player Extension
// Run this in the browser console to test the extension

console.log('🎵 Spotify Tab Player Debug Script');
console.log('==================================');

// Test 1: Check if extension is loaded
if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('✅ Chrome extension API available');
  
  // Test 2: Try to send a message to the background script
  chrome.runtime.sendMessage({ type: 'TEST_REDIRECT_URI' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Extension communication failed:', chrome.runtime.lastError);
    } else if (response && response.redirectUri) {
      console.log('✅ Extension is working!');
      console.log('📋 Redirect URI:', response.redirectUri);
      console.log('');
      console.log('🔧 Next steps:');
      console.log('1. Copy the redirect URI above');
      console.log('2. Go to Spotify Developer Dashboard');
      console.log('3. Add this URI to your app\'s redirect URIs');
      console.log('4. Try authenticating again');
    } else {
      console.error('❌ Unexpected response:', response);
    }
  });
} else {
  console.error('❌ Chrome extension API not available');
  console.log('Make sure you\'re running this in a Chrome extension context');
}

// Test 3: Check for common issues
console.log('');
console.log('🔍 Common Issues Check:');
console.log('- Spotify Premium account required');
console.log('- Spotify app must be open (desktop app or web player)');
console.log('- Redirect URI must be registered in Spotify app settings');
console.log('- Extension must be reloaded after changes');
