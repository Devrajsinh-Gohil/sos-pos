import { NextRequest, NextResponse } from "next/server";
import { SocialPlatform, exchangeCodeForToken } from "../../../../lib/social-auth";
import { cookies } from "next/headers";
import { decryptData, encryptData } from "../../../../lib/encryption";

interface PlatformCredentials {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  platform: SocialPlatform;
  [key: string]: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: SocialPlatform } }
) {
  const { platform } = params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const cookieStore = cookies();
  
  // Add debug log for callback parameters
  console.log(`Callback received for ${platform}:
    Code present: ${!!code}
    Error: ${error || 'none'}
    Error Description: ${errorDescription || 'none'}
  `);

  // Get debug info
  const debugCookie = cookieStore.get(`${platform}_auth_debug`);
  let debugInfo = {};
  
  if (debugCookie) {
    try {
      debugInfo = JSON.parse(debugCookie.value);
    } catch (e) {
      console.error('Failed to parse debug cookie', e);
    }
  }
  
  // Handle error from OAuth provider
  if (error) {
    console.error(`OAuth error for ${platform}:`, error, errorDescription);
    // Store error details in debug cookie
    cookieStore.set(`${platform}_auth_error`, JSON.stringify({
      error,
      errorDescription,
      timestamp: new Date().toISOString(),
      ...debugInfo
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 30, // 30 minutes
      path: '/'
    });
    
    // Create a debugging cookie with error info
    cookieStore.set(`${platform}_callback_error`, JSON.stringify({
      timestamp: new Date().toISOString(),
      error,
      errorDescription,
      searchParams: Object.fromEntries(searchParams.entries())
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 30, // 30 minutes
      path: '/'
    });
    
    return NextResponse.redirect(
      new URL(`/social-media-generator?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }
  
  // Check if the code is present
  if (!code) {
    console.error(`No authorization code provided for ${platform}`);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?error=No authorization code received`
    );
  }
  
  // Retrieve user credentials
  const credentialsCookie = cookieStore.get(`${platform}_credentials`);
  if (!credentialsCookie) {
    console.error(`No credentials found for ${platform} during callback`);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?error=Credentials not found. Please try connecting again.`
    );
  }
  
  try {
    // Decrypt credentials
    const credentials = JSON.parse(
      decryptData(credentialsCookie.value)
    ) as PlatformCredentials;
    
    // Exchange code for token using user credentials
    console.log(`Exchanging code for ${platform} token...`);
    
    // Instagram has a specific token exchange flow, different from other platforms
    let tokenData;
    if (platform === 'instagram') {
      try {
        // Instagram requires a different format and endpoint for token exchange
        const formData = new URLSearchParams();
        formData.append('client_id', credentials.client_id);
        formData.append('client_secret', credentials.client_secret);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', credentials.redirect_uri);
        formData.append('code', code);
        
        console.log('Instagram token exchange parameters:', {
          client_id: credentials.client_id,
          redirect_uri: credentials.redirect_uri,
          code_length: code.length
        });
        
        const response = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Instagram token exchange error:', errorText);
          throw new Error(`Instagram token exchange failed: ${response.status} ${errorText}`);
        }
        
        // Parse the response
        tokenData = await response.json();
        console.log('Instagram token exchange success:', Object.keys(tokenData));
        
        // Add expiry time if not included
        if (!tokenData.expires_at) {
          tokenData.expires_at = Date.now() + (60 * 60 * 24 * 60 * 1000); // 60 days, Instagram tokens last longer
        }
      } catch (error) {
        console.error('Instagram token exchange error:', error);
        throw error;
      }
    } else {
      // Use standard token exchange for other platforms
      tokenData = await exchangeCodeForToken(platform, code, credentials);
    }
    
    // Encrypt token data before storing
    const encryptedToken = encryptData(JSON.stringify(tokenData));
    
    // Store token in cookies
    cookieStore.set(`${platform}_token`, encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    // Set success cookie to confirm authentication
    cookieStore.set(`${platform}_auth_success`, 'true', {
      httpOnly: false, // Allow JavaScript to read this cookie
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/'
    });
    
    console.log(`Successfully authenticated with ${platform}`);
    
    // Redirect to the home page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?success=Connected ${platform} successfully`
    );
  } catch (error) {
    console.error(`Error exchanging code for ${platform} token:`, error);
    
    // Store error details for debugging
    cookieStore.set(`${platform}_auth_error`, JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      ...debugInfo
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 30, // 30 minutes
      path: '/'
    });
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?error=Failed to authenticate with ${platform}`
    );
  }
} 