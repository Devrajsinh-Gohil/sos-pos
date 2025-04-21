import { cookies } from 'next/headers';
import { SocialPlatform, refreshAccessToken, TokenData } from './social-auth';
import { decryptData, encryptData } from './encryption';

/**
 * Check if a user has set up credentials for a platform
 * This is server-side only
 */
export async function hasCredentials(platform: SocialPlatform): Promise<boolean> {
  const cookieStore = cookies();
  const credentialsCookie = cookieStore.get(`${platform}_credentials`);
  return !!credentialsCookie;
}

/**
 * Get token data for a platform from cookies
 * This is server-side only
 */
export async function getTokenData(platform: SocialPlatform): Promise<TokenData | null> {
  // First check if credentials exist
  if (!await hasCredentials(platform)) {
    throw new Error(`No credentials found for ${platform}. Please set up your credentials first.`);
  }

  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(`${platform}_token`);
  
  if (!tokenCookie) {
    return null;
  }
  
  try {
    // Decrypt the token data
    const tokenData = JSON.parse(decryptData(tokenCookie.value)) as TokenData;
    
    // If the token is expired and we have a refresh token, refresh it
    if (tokenData.expires_at && tokenData.expires_at < Date.now() && tokenData.refresh_token) {
      return await refreshToken(platform, tokenData.refresh_token);
    }
    
    return tokenData;
  } catch (error) {
    console.error(`Error decrypting token for ${platform}:`, error);
    return null;
  }
}

/**
 * Refresh an expired token and update the cookie
 * This is server-side only
 */
export async function refreshToken(platform: SocialPlatform, refreshToken: string): Promise<TokenData | null> {
  try {
    // First check if credentials exist
    if (!await hasCredentials(platform)) {
      throw new Error(`No credentials found for ${platform}. Please set up your credentials first.`);
    }

    // Get the credentials to use for refreshing
    const cookieStore = cookies();
    const credentialsCookie = cookieStore.get(`${platform}_credentials`);
    
    if (!credentialsCookie) {
      throw new Error(`No credentials found for ${platform}`);
    }
    
    const credentials = JSON.parse(decryptData(credentialsCookie.value));
    
    // Attempt to refresh the token using the credentials
    const newTokenData = await refreshAccessToken(platform, refreshToken, credentials);
    
    // Encrypt and store the updated token
    const encryptedData = encryptData(JSON.stringify(newTokenData));
    
    cookieStore.set(`${platform}_token`, encryptedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: newTokenData.expires_at 
        ? Math.floor((newTokenData.expires_at - Date.now()) / 1000) 
        : 30 * 24 * 60 * 60, // 30 days default
      path: '/'
    });
    
    return newTokenData;
  } catch (error) {
    console.error(`Error refreshing token for ${platform}:`, error);
    
    // Remove invalid token
    const cookieStore = cookies();
    cookieStore.delete(`${platform}_token`);
    
    return null;
  }
}

/**
 * Get access token with auto-refresh capability
 * This is server-side only and will handle refreshing expired tokens
 */
export async function getAccessToken(platform: SocialPlatform): Promise<string | null> {
  try {
    // First check if credentials exist
    if (!await hasCredentials(platform)) {
      throw new Error(`No credentials found for ${platform}. Please set up your credentials first.`);
    }
    
    const tokenData = await getTokenData(platform);
    return tokenData?.access_token || null;
  } catch (error) {
    console.error(`Error getting access token for ${platform}:`, error);
    return null;
  }
} 