import { NextRequest, NextResponse } from "next/server";
import { SocialPlatform } from "../../../../lib/social-auth";
import { cookies } from "next/headers";
import { decryptData } from "../../../../lib/encryption";

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: SocialPlatform } }
) {
  try {
    const platform = params.platform as SocialPlatform;
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(`${platform}_token`);
    
    if (!tokenCookie) {
      return NextResponse.json({ authenticated: false });
    }
    
    try {
      // Decrypt and parse the token data
      const tokenData = JSON.parse(decryptData(tokenCookie.value));
      
      // Check if token is expired
      if (tokenData.expires_at && tokenData.expires_at < Date.now()) {
        // Token is expired
        return NextResponse.json({ authenticated: false, reason: 'expired' });
      }
      
      // Token exists and is valid
      return NextResponse.json({ authenticated: true });
    } catch (error) {
      console.error(`Error parsing token for ${platform}:`, error);
      return NextResponse.json({ authenticated: false, reason: 'invalid' });
    }
  } catch (error) {
    console.error(`Error checking auth status for ${params.platform}:`, error);
    return NextResponse.json(
      { error: "Failed to check authentication status" },
      { status: 500 }
    );
  }
} 