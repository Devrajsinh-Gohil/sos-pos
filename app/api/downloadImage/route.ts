import { NextRequest, NextResponse } from "next/server";
import { createSafeFilename } from "../../lib/utils";

// Allowed image domains for security
const ALLOWED_DOMAINS = [
  'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E images
  'cdn.openai.com' // OpenAI CDN
];

/**
 * Validates if the URL is from an allowed domain
 */
function isAllowedImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_DOMAINS.some(domain => parsedUrl.hostname === domain);
  } catch {
    return false;
  }
}

/**
 * API route handler for downloading images
 */
export async function GET(request: NextRequest) {
  try {
    // Get the image URL from query parameters
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");
    const filename = searchParams.get("filename") || "generated-image";
    
    // Validate URL parameter
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    // Security check: Only allow images from trusted domains
    if (!isAllowedImageUrl(imageUrl)) {
      console.warn(`Blocked download attempt from untrusted domain: ${imageUrl}`);
      return NextResponse.json(
        { error: "Image URL not allowed for security reasons" },
        { status: 403 }
      );
    }

    // Fetch the image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const imageResponse = await fetch(imageUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Social Media Content Generator'
        }
      });
      clearTimeout(timeoutId);
      
      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` },
          { status: 500 }
        );
      }

      // Verify content type is an image
      const contentType = imageResponse.headers.get("Content-Type") || "";
      if (!contentType.startsWith("image/")) {
        return NextResponse.json(
          { error: "URL does not point to a valid image" },
          { status: 400 }
        );
      }

      // Get the image as array buffer
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageArrayBuffer);
      
      // Create a safe filename
      const safeFilename = createSafeFilename(filename, ".png");
      
      // Return the image with appropriate headers
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${safeFilename}"`,
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: "Image download timed out" },
          { status: 504 }
        );
      }
      throw fetchError; // Re-throw for the outer catch
    }
  } catch (error) {
    console.error("Error downloading image:", error);
    return NextResponse.json(
      { error: "Failed to download image" },
      { status: 500 }
    );
  }
} 