import { socialAuthConfig } from './social-auth-config';
import axios from 'axios';

export type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'instagram';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
}

export interface PlatformCredentials {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  platform: SocialPlatform;
  [key: string]: string;
}

// Generate authorization URL for a platform
export function getAuthorizationUrl(platform: SocialPlatform): string {
  const config = socialAuthConfig[platform];
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: platform // Used to identify which platform the user authenticated with
  });
  
  return `${config.authUrl}?${params.toString()}`;
}

// Exchange authorization code for access token - server side only
export async function exchangeCodeForToken(
  platform: SocialPlatform, 
  code: string,
  credentials?: PlatformCredentials
): Promise<TokenData> {
  // Use provided credentials if available, otherwise use default config
  const config = socialAuthConfig[platform];
  
  // Determine which credentials to use
  const clientId = credentials?.client_id || config.clientId;
  const clientSecret = credentials?.client_secret || config.clientSecret;
  const redirectUri = credentials?.redirect_uri || config.redirectUri;
  
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });
  
  // Platform-specific headers and modifications
  let headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  
  // Twitter requires Basic auth
  if (platform === 'twitter') {
    headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  }
  
  try {
    const response = await axios.post(config.tokenUrl, params.toString(), {
      headers,
    });
    
    const data = response.data;
    
    // Calculate expiration time if provided as expires_in seconds
    if (data.expires_in && !data.expires_at) {
      data.expires_at = Date.now() + (data.expires_in * 1000);
    }
    
    return data;
  } catch (error) {
    console.error(`Error exchanging code for ${platform}:`, error);
    throw error;
  }
}

// Client-side function to check authentication status
export async function checkAuthStatus(platform: SocialPlatform): Promise<boolean> {
  try {
    // First check if credentials exist
    const credResponse = await fetch(`/api/auth/credentials/${platform}`);
    const credData = await credResponse.json();
    
    if (!credData.hasCredentials) {
      return false; // No credentials set up
    }
    
    // Then check auth status
    const response = await fetch(`/api/auth/status/${platform}`);
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error(`Error checking auth status for ${platform}:`, error);
    return false;
  }
}

// Client-side function to logout
export async function logout(platform: SocialPlatform): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/logout/${platform}`, {
      method: 'POST'
    });
    return response.ok;
  } catch (error) {
    console.error(`Error logging out ${platform}:`, error);
    return false;
  }
}

// Refresh an expired token - server side only
export async function refreshAccessToken(
  platform: SocialPlatform, 
  refreshToken: string,
  credentials: PlatformCredentials
): Promise<TokenData> {
  const { client_id, client_secret } = credentials;
  
  // Prepare the basic refresh token request
  const params = new URLSearchParams({
    client_id,
    client_secret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });
  
  let tokenUrl: string;
  let headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  
  // Platform-specific token refresh endpoints and formats
  switch (platform) {
    case 'facebook':
      tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
      break;
      
    case 'twitter':
      tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      // Twitter requires Basic auth
      headers['Authorization'] = `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`;
      break;
      
    case 'linkedin':
      tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      break;
      
    case 'instagram':
      tokenUrl = 'https://graph.instagram.com/refresh_access_token';
      // Instagram has a different refresh mechanism
      params.delete('client_secret');
      params.delete('refresh_token');
      params.set('grant_type', 'ig_refresh_token');
      params.set('access_token', refreshToken);
      break;
      
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  try {
    const response = await axios.post(tokenUrl, params.toString(), { headers });
    const data = response.data;
    
    // Calculate expiration time if provided as expires_in seconds
    if (data.expires_in && !data.expires_at) {
      data.expires_at = Date.now() + (data.expires_in * 1000);
    }
    
    // Some OAuth providers don't return a new refresh token, preserve the old one
    if (!data.refresh_token && refreshToken) {
      data.refresh_token = refreshToken;
    }
    
    return data;
  } catch (error) {
    console.error(`Error refreshing token for ${platform}:`, error);
    throw error;
  }
} 