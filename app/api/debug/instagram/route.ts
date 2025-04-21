import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptData } from "../../../lib/encryption";

// Diagnostic endpoint to check Instagram setup and configuration
export async function GET() {
  try {
    const cookieStore = cookies();
    const diagnosticInfo: Record<string, any> = {
      timestamp: new Date().toISOString(),
      cookies: {},
      meta_app_info: null,
      connectivity_checks: {},
    };

    // Check for Instagram-related cookies (without exposing sensitive info)
    const instagramCredentialsCookie = cookieStore.get('instagram_credentials');
    diagnosticInfo.cookies.has_credentials = !!instagramCredentialsCookie;
    
    const instagramTokenCookie = cookieStore.get('instagram_token');
    diagnosticInfo.cookies.has_token = !!instagramTokenCookie;
    
    const instagramDebugCookie = cookieStore.get('instagram_auth_debug');
    if (instagramDebugCookie) {
      try {
        diagnosticInfo.cookies.auth_debug = JSON.parse(instagramDebugCookie.value);
      } catch (e) {
        diagnosticInfo.cookies.auth_debug = { error: "Failed to parse debug data" };
      }
    }
    
    const instagramErrorCookie = cookieStore.get('instagram_auth_error');
    if (instagramErrorCookie) {
      try {
        diagnosticInfo.cookies.auth_error = JSON.parse(instagramErrorCookie.value);
      } catch (e) {
        diagnosticInfo.cookies.auth_error = { error: "Failed to parse error data" };
      }
    }
    
    // Check for decryption errors
    const decryptErrorCookie = cookieStore.get('instagram_decrypt_error');
    if (decryptErrorCookie) {
      try {
        diagnosticInfo.cookies.decrypt_error = JSON.parse(decryptErrorCookie.value);
      } catch (e) {
        diagnosticInfo.cookies.decrypt_error = { error: "Failed to parse decrypt error data" };
      }
    }

    // Extract Meta app info (only non-sensitive parts)
    if (instagramCredentialsCookie) {
      try {
        const credentials = JSON.parse(decryptData(instagramCredentialsCookie.value));
        diagnosticInfo.meta_app_info = {
          app_id_valid: credentials.client_id && /^\d+$/.test(credentials.client_id.trim()),
          app_id_length: credentials.client_id ? credentials.client_id.length : 0,
          has_secret: !!credentials.client_secret,
          redirect_uri: credentials.redirect_uri,
          redirect_uri_valid: credentials.redirect_uri && credentials.redirect_uri.startsWith('http')
        };
      } catch (e) {
        diagnosticInfo.meta_app_info = { error: "Failed to decode credentials" };
      }
    }

    // Perform connectivity checks
    try {
      const metaApiResponse = await fetch('https://graph.facebook.com/v19.0/', { 
        method: 'HEAD',
        cache: 'no-store'
      });
      diagnosticInfo.connectivity_checks.meta_api = {
        status: metaApiResponse.status,
        ok: metaApiResponse.ok
      };
    } catch (e: any) {
      diagnosticInfo.connectivity_checks.meta_api = { error: e.message || "Unknown error" };
    }

    // Check environment configuration
    diagnosticInfo.environment = {
      has_base_url: !!process.env.NEXT_PUBLIC_BASE_URL,
      base_url: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
      node_env: process.env.NODE_ENV
    };

    return NextResponse.json(diagnosticInfo);
  } catch (error) {
    console.error("Error generating Instagram diagnostic info:", error);
    return NextResponse.json(
      { error: "Failed to generate diagnostic information" },
      { status: 500 }
    );
  }
} 