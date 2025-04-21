import { NextRequest, NextResponse } from "next/server";
import { publishContent } from "../../../lib/social-publishing";
import { SocialPlatform } from "../../../lib/social-auth";
import { getAccessToken } from "../../../lib/token-service";

interface PublishRequest {
  text: string;
  imageUrl?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: SocialPlatform } }
) {
  try {
    const platform = params.platform as SocialPlatform;
    const requestData = await request.json() as PublishRequest;
    const { text, imageUrl } = requestData;

    // Check authentication first
    const token = await getAccessToken(platform);
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: `Not authenticated with ${platform}. Please connect your account first.` 
        },
        { status: 401 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { 
          success: false,
          error: "Text content is required" 
        },
        { status: 400 }
      );
    }

    // For Instagram, an image is required
    if (platform === "instagram" && !imageUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: "An image is required for Instagram posts" 
        },
        { status: 400 }
      );
    }

    const result = await publishContent(platform, { text, imageUrl });

    if (result.success) {
      return NextResponse.json({
        success: true,
        postId: result.postId,
        message: `Successfully published to ${platform}`
      });
    } else {
      const statusCode = result.error?.includes("rate limit") ? 429 :
                         result.error?.includes("permission") ? 403 :
                         result.error?.includes("authentication") ? 401 : 400;
                         
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || `Failed to publish to ${platform}` 
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error(`Error publishing to ${params.platform}:`, error);
    
    // Determine error type and set appropriate status code
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || 
                         error.message || 
                         "Failed to publish content";
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
} 