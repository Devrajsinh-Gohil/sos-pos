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
    
    // Remove the token cookie
    cookieStore.delete(`${platform}_token`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error logging out from ${params.platform}:`, error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 