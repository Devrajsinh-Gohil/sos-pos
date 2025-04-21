import { NextRequest, NextResponse } from "next/server";
import { SocialPlatform } from "../../../../lib/social-auth";
import { cookies } from "next/headers";
import { encryptData } from "../../../../lib/encryption";

interface PlatformCredentials {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  platform: SocialPlatform;
  [key: string]: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: SocialPlatform } }
) {
  try {
    const platform = params.platform as SocialPlatform;
    const credentials = await request.json() as PlatformCredentials;

    // Validate required fields
    if (!credentials.client_id || !credentials.client_secret || !credentials.redirect_uri) {
      return NextResponse.json(
        { error: "Missing required credentials" },
        { status: 400 }
      );
    }

    // Trim whitespace from values to prevent issues
    Object.keys(credentials).forEach(key => {
      if (typeof credentials[key] === 'string') {
        credentials[key] = credentials[key].trim();
      }
    });

    // Validate redirect URI format
    try {
      const url = new URL(credentials.redirect_uri);
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid redirect URI protocol');
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid redirect URI format. Please provide a valid URL with no spaces or special characters." },
        { status: 400 }
      );
    }

    // Add platform to credentials object
    credentials.platform = platform;

    // Extra validation for Instagram (which uses Facebook's developer platform)
    if (platform === 'instagram') {
      // Ensure the client_id is numeric (as Instagram App IDs should be)
      if (!/^\d+$/.test(credentials.client_id)) {
        return NextResponse.json(
          { 
            error: "Instagram App ID should be numeric. Make sure you're using the App ID from Meta for Developers, not the app name.",
            tip: "Check your Meta for Developers dashboard under Settings > Basic to find your App ID."
          },
          { status: 400 }
        );
      }
      
      console.log(`Setting up Instagram with App ID: ${credentials.client_id}`);
    }

    // Encrypt credentials before storing
    const encryptedCredentials = encryptData(JSON.stringify(credentials));

    // Store in secure HttpOnly cookie with longer max age
    const cookieStore = cookies();
    cookieStore.set(`${platform}_credentials`, encryptedCredentials, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Return success response with the sanitized redirect URI
    return NextResponse.json({ 
      success: true,
      redirect_uri: credentials.redirect_uri 
    });
  } catch (error) {
    console.error(`Error saving ${params.platform} credentials:`, error);
    return NextResponse.json(
      { error: "Failed to save credentials. Please try again." },
      { status: 500 }
    );
  }
} 