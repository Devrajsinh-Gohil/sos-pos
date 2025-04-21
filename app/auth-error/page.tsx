"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    // Get error info from URL params
    const platformParam = searchParams.get("platform");
    const errorParam = searchParams.get("error");

    if (platformParam) {
      setPlatform(platformParam);
    }

    if (errorParam) {
      setError(errorParam);
    }

    // Try to get error details from cookie
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
      }
      return null;
    };

    try {
      const errorCookie = getCookieValue(`${platformParam}_auth_error`);
      if (errorCookie) {
        const parsedError = JSON.parse(decodeURIComponent(errorCookie));
        setErrorDetails(parsedError);
      }
    } catch (e) {
      console.error("Failed to parse error cookie", e);
    }
  }, [searchParams]);

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="shadow-lg border-red-200 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 dark:text-red-400 h-7 w-7" />
            <CardTitle className="text-xl text-red-800 dark:text-red-400">
              Authentication Error
            </CardTitle>
          </div>
          <CardDescription className="text-red-700 dark:text-red-300">
            There was a problem connecting to {platform || "the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300">
                <strong>Error message:</strong> {error || "Unknown error"}
              </p>
              {errorDetails && (
                <div className="mt-2 text-sm">
                  <p><strong>Time:</strong> {new Date(errorDetails.timestamp).toLocaleString()}</p>
                  {errorDetails.errorDescription && (
                    <p><strong>Details:</strong> {errorDetails.errorDescription}</p>
                  )}
                  {errorDetails.redirect_uri && (
                    <p><strong>Redirect URI:</strong> {errorDetails.redirect_uri}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Common causes of this error:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Incorrect App ID or App Secret</li>
                <li>Redirect URI mismatch with what's configured in the developer portal</li>
                <li>Your app does not have the required permissions</li>
                <li>Your developer account needs to complete app verification</li>
                <li>The authorization was denied by the user</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-900/20 border-t">
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href={`https://developers.${platform}.com`} target="_blank">
              {platform ? `${platform.charAt(0).toUpperCase() + platform.slice(1)} Developer Portal` : "Developer Documentation"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 