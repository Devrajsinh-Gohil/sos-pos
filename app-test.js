// App integration test for Instagram OAuth
const axios = require('axios');
const qs = require('querystring');

// Instagram credentials
const credentials = {
  client_id: '1678928906030904',
  client_secret: '67e94277678133996e146087259a44fc',
  redirect_uri: 'https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/callback/instagram',
  platform: 'instagram'
};

// API endpoint to save credentials (your app's endpoint)
const SETUP_ENDPOINT = 'https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/setup/instagram';

// Function to test saving credentials
async function testSavingCredentials() {
  console.log('📤 Testing saving credentials to your app...');
  console.log(`Endpoint: ${SETUP_ENDPOINT}`);
  
  try {
    const response = await axios.post(SETUP_ENDPOINT, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Credentials saved successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
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
  const loginUrl = `https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/login/instagram`;
  
  console.log('🔄 Testing OAuth login initiation...');
  console.log(`Login URL: ${loginUrl}`);
  
  try {
    // We expect this to redirect, so we handle it differently than a normal request
    const response = await axios.get(loginUrl, {
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

// Main function to run all tests
async function runTests() {
  console.log('🧪 Starting Instagram App Integration Test');
  console.log('==========================================');
  
  // Test 1: Save credentials
  const credentialsSaved = await testSavingCredentials();
  console.log('------------------------------------------');
  
  // Test 2: Initiate OAuth login
  if (credentialsSaved) {
    const loginInitiated = await testOAuthLogin();
    console.log('------------------------------------------');
    
    if (loginInitiated) {
      console.log('✅ All tests passed successfully!');
      console.log('');
      console.log('What to check next:');
      console.log('1. Verify that your Instagram app has the correct redirect URI');
      console.log('   -> https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/callback/instagram');
      console.log('2. Make sure your app is properly configured with Instagram Basic Display');
      console.log('3. Check if your app is in Development mode');
      console.log('4. Verify that you have added your Instagram test user to the app');
    } else {
      console.log('❌ OAuth login initiation test failed');
    }
  } else {
    console.log('❌ Credential saving test failed. Cannot proceed with login test.');
    console.log('');
    console.log('Common issues:');
    console.log('1. Your app\'s API route might not be properly implemented');
    console.log('2. Your Ngrok tunnel might not be active or might have changed URL');
    console.log('3. Your server might not be running');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
}); 