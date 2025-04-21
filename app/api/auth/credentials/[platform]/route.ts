import { NextRequest, NextResponse } from "next/server";
import { SocialPlatform } from "../../../../lib/social-auth";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: SocialPlatform } }
) {
  try {
    const platform = params.platform as SocialPlatform;
    const cookieStore = cookies();
    
    // Check if credentials exist for this platform
    const credentialsCookie = cookieStore.get(`${platform}_credentials`);
    const hasCredentials = !!credentialsCookie;
    
    return NextResponse.json({ hasCredentials });
  } catch (error) {
    console.error(`Error checking credentials for ${params.platform}:`, error);
    return NextResponse.json(
      { error: "Failed to check credentials" },
      { status: 500 }
    );
  }
} 