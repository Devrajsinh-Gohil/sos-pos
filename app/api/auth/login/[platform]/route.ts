import { NextRequest, NextResponse } from "next/server";
import { SocialPlatform } from "../../../../lib/social-auth";
import { cookies } from "next/headers";
import { decryptData } from "../../../../lib/encryption";

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
  try {
    const platform = params.platform as SocialPlatform;
    
    // Retrieve the user's credentials from cookies
    const cookieStore = cookies();
    const credentialsCookie = cookieStore.get(`${platform}_credentials`);
    
    if (!credentialsCookie) {
      console.error(`No credentials cookie found for ${platform}`);
      return NextResponse.json(
        { error: "Platform credentials not found. Please set up your credentials first." },
        { status: 400 }
      );
    }
    
    try {
      // Decrypt credentials
      let credentials;
      try {
        credentials = JSON.parse(
          decryptData(credentialsCookie.value)
        ) as PlatformCredentials;
      } catch (decryptError) {
        console.error(`Error decrypting ${platform} credentials:`, decryptError);
        
        // Store information about the decryption error
        cookieStore.set(`${platform}_decrypt_error`, JSON.stringify({
          timestamp: new Date().toISOString(),
          message: decryptError instanceof Error ? decryptError.message : 'Unknown error',
          cookie_length: credentialsCookie.value.length
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 30, // 30 minutes
          path: '/'
        });
        
        // Clear the corrupted credentials cookie
        cookieStore.set(`${platform}_credentials`, '', {
          maxAge: 0,
          path: '/'
        });
        
        return NextResponse.redirect(
          new URL(`/debug-instagram?error=${encodeURIComponent('Credentials decryption failed. Please reconnect your account.')}`, request.url)
        );
      }
      
      console.log(`Retrieved credentials for ${platform}`, {
        clientId: credentials.client_id,
        redirectUri: credentials.redirect_uri,
        hasCreds: !!credentials
      });
      
      // Ensure redirect URI has no whitespace
      if (credentials.redirect_uri) {
        credentials.redirect_uri = credentials.redirect_uri.trim();
      }
      
      // Generate the authorization URL using the provided credentials
      const authUrl = getAuthorizationUrl(platform, credentials);
      
      // Set debug cookie to help with troubleshooting
      cookieStore.set(`${platform}_auth_debug`, JSON.stringify({
        timestamp: new Date().toISOString(),
        redirect_uri: credentials.redirect_uri,
        attempted: true,
        auth_url: platform === 'instagram' ? authUrl.substring(0, 100) + '...' : null,
        app_id_length: credentials.client_id?.length || 0,
        has_client_secret: !!credentials.client_secret
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 30, // 30 minutes
        path: '/'
      });
      
      // For Instagram, log out more details
      if (platform === 'instagram') {
        console.log(`Instagram auth debug:
          App ID length: ${credentials.client_id?.length || 0}
          Redirect URI: ${credentials.redirect_uri}
          Auth URL: ${authUrl}
        `);
      }
      
      // Redirect the user to the platform's OAuth login page
      return NextResponse.redirect(authUrl);
    } catch (error) {
      console.error(`Error parsing ${platform} credentials:`, error);
      return NextResponse.json(
        { error: "Invalid credentials data. Please set up your credentials again." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(`Error initiating ${params.platform} login:`, error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/?error=Failed to initiate login`
    );
  }
}

// Generate authorization URL based on platform and user credentials
function getAuthorizationUrl(platform: SocialPlatform, credentials: PlatformCredentials): string {
  const { client_id, redirect_uri } = credentials;
  
  // Base parameters for OAuth authorization
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    state: platform // Used to identify which platform the user authenticated with
  });
  
  // Platform-specific OAuth endpoints and scopes
  switch (platform) {
    case 'facebook':
      params.append('scope', 'pages_manage_posts,pages_read_engagement,publish_to_groups');
      return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
      
    case 'twitter':
      params.append('scope', 'tweet.read tweet.write users.read offline.access');
      return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
      
    case 'linkedin':
      params.append('scope', 'r_liteprofile w_member_social');
      return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      
    case 'instagram':
      // For Instagram, ensure we're using the correct format required by Meta
      const instagramParams = new URLSearchParams({
        app_id: client_id, // Instagram uses app_id instead of client_id
        redirect_uri,
        response_type: 'code',
        scope: 'instagram_basic,instagram_content_publish',
        state: platform
      });
      
      // Log the final URL for debugging
      const instagramUrl = `https://api.instagram.com/oauth/authorize?${instagramParams.toString()}`;
      console.log(`Instagram authorization URL: ${instagramUrl}`);
      return instagramUrl;
      
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
} 