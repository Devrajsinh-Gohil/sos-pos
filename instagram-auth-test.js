const axios = require('axios');
const url = require('url');

// Instagram credentials
const credentials = {
  client_id: '1678928906030904',
  client_secret: '67e94277678133996e146087259a44fc',
  redirect_uri: 'https://01d0-2402-a00-402-aab1-b93f-4717-128d-426f.ngrok-free.app/api/auth/callback/instagram',
  scope: 'instagram_basic,instagram_content_publish'
};

// Function to validate the redirect URI format
function validateRedirectUri(redirectUri) {
  try {
    const parsedUrl = new URL(redirectUri);
    console.log('✅ Redirect URI format is valid');
    return true;
  } catch (error) {
    console.error('❌ Invalid redirect URI format:', error.message);
    return false;
  }
}

// Function to generate Instagram authorization URL
function getInstagramAuthUrl() {
  const params = new URLSearchParams({
    client_id: credentials.client_id,
    redirect_uri: credentials.redirect_uri,
    scope: credentials.scope,
    response_type: 'code'
  });
  
  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

// Function to test accessing the authorization URL
async function testAuthorizationUrl() {
  const authUrl = getInstagramAuthUrl();
  console.log('Generated Authorization URL:', authUrl);
  
  try {
    // Make a HEAD request to check if the URL is accessible
    // We don't follow redirects as we just want to check if the initial URL works
    const response = await axios.head(authUrl, { 
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    console.log('✅ Authorization URL is accessible');
    console.log('Response status:', response.status);
    return true;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 302) {
        console.log('✅ Received redirect response (302), which is expected for OAuth flow');
        console.log('Redirect location:', error.response.headers.location);
        return true;
      } else {
        console.error('❌ Request failed with status code:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('❌ Error setting up request:', error.message);
    }
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Instagram OAuth Connection Test');
  console.log('------------------------------------------');
  console.log('Testing with the following credentials:');
  console.log(`Client ID: ${credentials.client_id}`);
  console.log(`Client Secret: ${credentials.client_secret.substring(0, 5)}${'*'.repeat(10)}`);
  console.log(`Redirect URI: ${credentials.redirect_uri}`);
  console.log(`Scope: ${credentials.scope}`);
  console.log('------------------------------------------');
  
  // Validate redirect URI format
  const isUriValid = validateRedirectUri(credentials.redirect_uri);
  if (!isUriValid) {
    console.log('❌ Test failed: Invalid redirect URI format');
    return;
  }
  
  // Test authorization URL
  console.log('Testing authorization URL...');
  const isAuthUrlValid = await testAuthorizationUrl();
  
  if (isAuthUrlValid) {
    console.log('------------------------------------------');
    console.log('✅ Test completed successfully!');
    console.log('The authorization URL is properly formed and accessible.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Make sure this redirect URI is added to your Instagram app');
    console.log('2. Ensure your app is properly configured with Instagram Basic Display');
    console.log('3. Try the OAuth flow in your application');
  } else {
    console.log('------------------------------------------');
    console.log('❌ Test failed: Could not access authorization URL');
    console.log('');
    console.log('Possible issues:');
    console.log('1. Your app ID might be incorrect');
    console.log('2. Your app might not have Instagram Basic Display properly set up');
    console.log('3. Your redirect URI might not be registered in the app settings');
    console.log('4. Instagram API might be temporarily unavailable');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
}); 