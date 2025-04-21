import { NextRequest, NextResponse } from "next/server";
import { SocialPlatform } from "../../../../lib/social-auth";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: SocialPlatform } }
) {
  try {
    const platform = params.platform as SocialPlatform;
    const cookieStore = cookies();
    
    // List of all cookies to clear for this platform
    const cookiesToClear = [
      `${platform}_credentials`,
      `${platform}_token`,
      `${platform}_auth_debug`,
      `${platform}_auth_error`,
      `${platform}_callback_error`,
      `${platform}_decrypt_error`,
      `${platform}_auth_success`
    ];
    
    // Clear all cookies
    for (const cookieName of cookiesToClear) {
      cookieStore.set(cookieName, '', {
        maxAge: 0,
        path: '/'
      });
    }
    
    console.log(`Reset all cookies for ${platform}`);
    
    // Log to help with debugging
    return NextResponse.json({ 
      success: true, 
      message: `All ${platform} connection data has been reset`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error resetting ${params.platform} connection:`, error);
    return NextResponse.json(
      { error: "Failed to reset connection" },
      { status: 500 }
    );
  }
} 