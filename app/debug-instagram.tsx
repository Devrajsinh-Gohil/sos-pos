"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function InstagramDebugPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [appCheckResult, setAppCheckResult] = useState<any>(null);
  const [isCheckingApp, setIsCheckingApp] = useState(false);

  // Fetch debug data
  const fetchDebugData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug/instagram', {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Debug API returned status ${response.status}`);
      }
      
      const data = await response.json();
      setDebugData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load debug information');
      console.error('Debug fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check Meta App configuration
  const checkInstagramApp = async () => {
    if (!debugData?.meta_app_info?.app_id_valid) {
      setAppCheckResult({ error: "No valid App ID found. Please connect Instagram first." });
      return;
    }
    
    setIsCheckingApp(true);
    try {
      // This just does a generic check if the app ID is valid by hitting the Graph API
      const appId = debugData.meta_app_info.app_id_length;
      const response = await fetch(`https://graph.facebook.com/v19.0/debug_token?input_token=placeholder&access_token=placeholder`, {
        method: 'HEAD',
      });
      
      setAppCheckResult({
        timestamp: new Date().toISOString(),
        status: response.status,
        message: response.status === 400 
          ? "API responded (400 is expected without valid tokens)" 
          : `API responded with status ${response.status}`
      });
    } catch (err: any) {
      setAppCheckResult({
        error: err.message || "Failed to check app configuration",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsCheckingApp(false);
    }
  };

  // Clear all Instagram cookies and reset
  const resetInstagramConnection = async () => {
    setIsLoading(true);
    try {
      // Clear all Instagram cookies
      document.cookie = 'instagram_credentials=; Max-Age=0; path=/;';
      document.cookie = 'instagram_token=; Max-Age=0; path=/;';
      document.cookie = 'instagram_auth_debug=; Max-Age=0; path=/;';
      document.cookie = 'instagram_auth_error=; Max-Age=0; path=/;';
      document.cookie = 'instagram_callback_error=; Max-Age=0; path=/;';
      document.cookie = 'instagram_decrypt_error=; Max-Age=0; path=/;';
      
      // Call a new reset API endpoint we'll create
      const response = await fetch('/api/auth/reset/instagram', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reset Instagram connection: ${response.status}`);
      }
      
      // Success message
      alert('Instagram connection has been reset. You can now try connecting again.');
      
      // Refresh the debug data
      await fetchDebugData();
    } catch (err: any) {
      setError(err.message || 'Failed to reset Instagram connection');
      console.error('Reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the debug data fetch on load
  useEffect(() => {
    fetchDebugData();
  }, []);

  // Format boolean values for display
  const formatBool = (value: boolean | undefined) => {
    if (value === undefined) return '❓ Unknown';
    return value ? '✅ Yes' : '❌ No';
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <Button 
          variant="destructive"
          onClick={resetInstagramConnection}
          disabled={isLoading}
          className="flex items-center"
        >
          Reset Instagram Connection
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b">
          <CardTitle className="text-2xl">Instagram Integration Diagnostics</CardTitle>
          <CardDescription>
            Troubleshooting tool for Instagram API connectivity issues
          </CardDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={fetchDebugData} 
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : debugData ? (
            <>
              {/* Connection Status */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Instagram Connection Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <p className="text-sm font-medium">Credentials Stored</p>
                    <p className="text-lg">{formatBool(debugData.cookies.has_credentials)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <p className="text-sm font-medium">Token Stored</p>
                    <p className="text-lg">{formatBool(debugData.cookies.has_token)}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* App Configuration */}
              {debugData.meta_app_info && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Meta App Configuration</h2>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
                      <p className="text-sm font-medium">App ID Valid Format</p>
                      <p className="text-lg">{formatBool(debugData.meta_app_info.app_id_valid)}</p>
                      {!debugData.meta_app_info.app_id_valid && (
                        <p className="text-sm text-red-600 mt-2">App ID should be numeric. Check your Meta Developer console.</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
                      <p className="text-sm font-medium">App Secret Provided</p>
                      <p className="text-lg">{formatBool(debugData.meta_app_info.has_secret)}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm overflow-hidden">
                      <p className="text-sm font-medium">Redirect URI</p>
                      <p className="text-sm break-all font-mono mt-1">{debugData.meta_app_info.redirect_uri || "Not set"}</p>
                      {debugData.meta_app_info.redirect_uri && (
                        <p className={`text-sm mt-2 ${debugData.meta_app_info.redirect_uri_valid ? 'text-green-600' : 'text-red-600'}`}>
                          {debugData.meta_app_info.redirect_uri_valid ? "Valid URI format" : "Invalid URI format"}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={checkInstagramApp}
                        disabled={isCheckingApp || !debugData.meta_app_info.app_id_valid}
                        className="flex items-center"
                      >
                        {isCheckingApp ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Check Meta App Configuration
                      </Button>
                      
                      {appCheckResult && (
                        <div className={`mt-3 p-3 rounded-md ${appCheckResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                          {appCheckResult.error ? (
                            <p>{appCheckResult.error}</p>
                          ) : (
                            <p>{appCheckResult.message}</p>
                          )}
                          <p className="text-xs mt-1">Checked at: {appCheckResult.timestamp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {/* Error Details */}
              {debugData.cookies.auth_error && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Last Authentication Error</h2>
                  <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 p-4 rounded-md">
                    <p className="font-medium text-red-700">Error: {debugData.cookies.auth_error.error}</p>
                    {debugData.cookies.auth_error.errorDescription && (
                      <p className="mt-1 text-red-600">{debugData.cookies.auth_error.errorDescription}</p>
                    )}
                    <p className="text-xs mt-2">Time: {debugData.cookies.auth_error.timestamp}</p>
                  </div>
                </div>
              )}
              
              {/* Decryption Error */}
              {debugData.cookies.decrypt_error && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-red-700">🔑 Encryption Key Error Detected</h2>
                  <div className="bg-red-50 border-2 border-red-400 dark:bg-red-900/40 p-4 rounded-md">
                    <p className="font-medium text-red-700">Decryption Error: {debugData.cookies.decrypt_error.message}</p>
                    <p className="mt-2 text-red-600">
                      Your encryption key has likely changed since your credentials were stored. This happens when:
                    </p>
                    <ul className="list-disc ml-5 mt-2 text-red-600">
                      <li>The server was restarted without a persistent encryption key</li>
                      <li>The ENCRYPTION_KEY environment variable changed</li>
                      <li>The .encryption_key file was deleted or changed</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="font-medium text-yellow-800">Solution: Click the "Reset Instagram Connection" button above and then reconnect your account.</p>
                    </div>
                    <p className="text-xs mt-2">Error occurred: {debugData.cookies.decrypt_error.timestamp}</p>
                  </div>
                </div>
              )}
              
              {/* Debug Info */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Environment Information</h2>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm space-y-2">
                  <p><span className="font-medium">Base URL:</span> {debugData.environment.base_url}</p>
                  <p><span className="font-medium">Environment:</span> {debugData.environment.node_env}</p>
                  <p><span className="font-medium">Timestamp:</span> {debugData.timestamp}</p>
                </div>
              </div>
              
              {/* Meta API Connectivity */}
              <div>
                <h2 className="text-lg font-semibold mb-3">API Connectivity</h2>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
                  <p className="text-sm font-medium">Meta Graph API</p>
                  {debugData.connectivity_checks.meta_api.error ? (
                    <p className="text-red-600">{debugData.connectivity_checks.meta_api.error}</p>
                  ) : (
                    <p className={debugData.connectivity_checks.meta_api.ok ? 'text-green-600' : 'text-red-600'}>
                      Status: {debugData.connectivity_checks.meta_api.status} {debugData.connectivity_checks.meta_api.ok ? '(Connected)' : '(Failed)'}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p>No diagnostic data available.</p>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 dark:bg-gray-900/20 flex flex-col items-start space-y-4 pt-6">
          <h3 className="text-lg font-semibold">Troubleshooting Steps</h3>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Make sure your Meta app has the <strong>Instagram Basic Display</strong> product added.</li>
            <li>Verify your <strong>App ID</strong> is numeric and matches what's in your Meta Developer console.</li>
            <li>Ensure your <strong>Redirect URI</strong> is exactly the same in both this app and the Meta Developer console.</li>
            <li>Add the same Redirect URI to <strong>all three fields</strong>: Valid OAuth Redirect URIs, Deauthorize Callback URL, and Data Deletion Request URL.</li>
            <li>Make sure you have added your Instagram user as a <strong>test user</strong> in the Meta Developer console.</li>
            <li>Make sure your Instagram account is a <strong>Business or Creator account</strong>, not a personal account.</li>
            <li>Ensure your <strong>App Status</strong> is set to "In Development" in the Meta Developer console.</li>
          </ol>
          
          <div className="w-full flex justify-between items-center mt-4 pt-4 border-t">
            <Link href="/INSTAGRAM_SETUP.md" target="_blank" className="text-blue-500 hover:text-blue-700">
              View Full Instagram Setup Guide
            </Link>
            <Button variant="outline" onClick={fetchDebugData} disabled={isLoading}>
              Refresh Diagnostics
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 