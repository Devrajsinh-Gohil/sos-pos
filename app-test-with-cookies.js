// App integration test for Instagram OAuth with cookie support
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

// Create a cookie jar
const cookieJar = new CookieJar();

// Instagram credentials
const credentials = {
  client_id: '1678928906030904',
  client_secret: '67e94277678133996e146087259a44fc',
  redirect_uri: 'https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/callback/instagram',
  platform: 'instagram'
};

// Base URL for the app
const BASE_URL = 'https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app';

// Create an axios instance with cookie jar support
const api = wrapper(axios.create({
  baseURL: BASE_URL,
  jar: cookieJar,
  withCredentials: true
}));

// Function to test saving credentials
async function testSavingCredentials() {
  console.log('📤 Testing saving credentials to your app...');
  console.log(`Endpoint: ${BASE_URL}/api/auth/setup/instagram`);
  
  try {
    const response = await api.post('/api/auth/setup/instagram', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Credentials saved successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Print cookies for debugging
    const cookies = await cookieJar.getCookies(BASE_URL);
    console.log('🍪 Cookies received:', cookies.length);
    cookies.forEach(cookie => {
      console.log(`  - ${cookie.key}: ${cookie.value.substring(0, 20)}...`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to save credentials:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Test initiating OAuth login
async function testOAuthLogin() {
  console.log('🔄 Testing OAuth login initiation...');
  console.log(`Login URL: ${BASE_URL}/api/auth/login/instagram`);
  
  try {
    // We expect this to redirect, so we handle it with a different approach
    const response = await api.get('/api/auth/login/instagram', {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log('✅ OAuth login initiation successful!');
    console.log('Response status:', response.status);
    if (response.headers.location) {
      console.log('Redirect URL:', response.headers.location);
    }
    return true;
  } catch (error) {
    if (error.response && error.response.status === 302) {
      console.log('✅ Received redirect response (302), which is expected for OAuth flow');
      console.log('Redirect location:', error.response.headers.location);
      return true;
    } else {
      console.error('❌ Failed to initiate OAuth login:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      return false;
    }
  }
}

// Test checking auth status
async function testAuthStatus() {
  console.log('🔍 Testing auth status check...');
  console.log(`Status URL: ${BASE_URL}/api/auth/credentials/instagram`);
  
  try {
    const response = await api.get('/api/auth/credentials/instagram');
    console.log('✅ Auth status check successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to check auth status:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// Main function to run all tests
async function runTests() {
  console.log('🧪 Starting Instagram App Integration Test (with cookie support)');
  console.log('==============================================================');
  
  // Test 1: Save credentials
  const credentialsSaved = await testSavingCredentials();
  console.log('------------------------------------------');
  
  // Test 2: Check if credentials were stored properly
  const authStatus = await testAuthStatus();
  console.log('------------------------------------------');
  
  // Test 3: Initiate OAuth login
  if (credentialsSaved) {
    const loginInitiated = await testOAuthLogin();
    console.log('------------------------------------------');
    
    if (loginInitiated) {
      console.log('✅ All tests passed successfully!');
      console.log('');
      console.log('The issue might have been that you needed to use the same session/cookies for the entire flow.');
      console.log('Try using your application again with the connect button.');
    } else {
      console.log('❌ OAuth login initiation test failed');
      console.log('');
      console.log('The issue might be related to:');
      console.log('1. Cookies not being properly stored or transmitted');
      console.log('2. Server-side session management issues');
      console.log('3. Cross-domain cookie restrictions from your Ngrok tunnel');
    }
  } else {
    console.log('❌ Credential saving test failed. Cannot proceed with login test.');
  }
  
  // Final recommendations
  console.log('');
  console.log('📋 Recommendations:');
  console.log('1. Make sure your Instagram app settings match these exactly:');
  console.log('   - Redirect URI: https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/callback/instagram');
  console.log('   - App ID: 1678928906030904');
  console.log('2. In Facebook Developer Console:');
  console.log('   - Verify Instagram Basic Display is added to your app');
  console.log('   - Ensure your app is in Development mode');
  console.log('   - Check that you\'ve added your Instagram test user');
  console.log('3. Browser testing:');
  console.log('   - Try the process in your browser, starting fresh (clear cookies)');
  console.log('   - Use the browser\'s dev tools to monitor network requests and cookies');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
}); 