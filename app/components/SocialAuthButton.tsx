"use client";

import { Button } from "../../components/ui/button";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { useState, useEffect } from "react";
import { SocialPlatform, checkAuthStatus, logout } from "../lib/social-auth";
import { toast } from "../hooks/use-toast";
import PlatformCredentialsModal from "./PlatformCredentialsModal";

interface SocialAuthButtonProps {
  platform: SocialPlatform;
  label?: string;
}

export default function SocialAuthButton({ platform, label }: SocialAuthButtonProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const checkConnection = async () => {
    const isConnected = await checkAuthStatus(platform);
    setConnected(isConnected);
  };

  useEffect(() => {
    // Check authentication status on mount and periodically
    checkConnection();
    
    // Re-check status every 5 minutes to handle expired tokens
    const intervalId = setInterval(checkConnection, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [platform]);

  const handleLogin = async () => {
    // Show credentials modal instead of direct redirect
    setShowCredentialsModal(true);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const success = await logout(platform);
      
      if (success) {
        setConnected(false);
        toast({
          title: "Disconnected",
          description: `Successfully disconnected from ${platform}`,
        });
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      toast({
        title: "Disconnection Error",
        description: `Failed to disconnect from ${platform}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (credentials: Record<string, string>) => {
    setLoading(true);
    try {
      // Sanitize inputs to prevent issues
      const sanitizedCredentials = {
        ...credentials,
        redirect_uri: credentials.redirect_uri?.trim(),
        client_id: credentials.client_id?.trim(),
        client_secret: credentials.client_secret?.trim(),
        platform
      };
      
      // Show initial feedback toast
      toast({
        title: "Saving credentials",
        description: `Setting up your ${platform} credentials...`,
      });
      
      // Save credentials and initiate OAuth flow
      const response = await fetch(`/api/auth/setup/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedCredentials),
        // Ensure cookies are included
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save ${platform} credentials`);
      }

      // Show success toast
      toast({
        title: "Credentials Saved",
        description: `Successfully saved ${platform} credentials. Redirecting to authorization...`,
      });

      // Close modal
      setShowCredentialsModal(false);
      
      // Short delay before redirect to show the success message
      setTimeout(() => {
        // Redirect to OAuth login with credentials included
        window.location.href = `/api/auth/login/${platform}`;
      }, 1500);
    } catch (error) {
      console.error(`Error setting up ${platform} credentials:`, error);
      toast({
        title: "Setup Error",
        description: error instanceof Error ? error.message : `Failed to set up ${platform}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'facebook':
        return <FaFacebook className="h-4 w-4 mr-2" />;
      case 'twitter':
        return <FaTwitter className="h-4 w-4 mr-2" />;
      case 'linkedin':
        return <FaLinkedin className="h-4 w-4 mr-2" />;
      case 'instagram':
        return <FaInstagram className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    if (loading) return 'Loading...';
    if (connected) return `Disconnect ${label || platform}`;
    return `Connect ${label || platform}`;
  };

  return (
    <>
      <div className="relative group">
        <Button
          variant={connected ? "default" : "outline"}
          size="sm"
          onClick={connected ? handleLogout : handleLogin}
          disabled={loading}
          className={connected ? 
            "bg-green-600 hover:bg-green-700 text-white" : 
            "border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        >
          {getIcon()}
          {getButtonLabel()}
          {!connected && !loading && <span className="ml-1 text-xs">→</span>}
        </Button>
        
        {!connected && !loading && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            Click to enter your {platform} API credentials and connect your account
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </div>
        )}
      </div>

      {showCredentialsModal && (
        <PlatformCredentialsModal
          platform={platform}
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setLoading(false);
          }}
          onSubmit={handleCredentialsSubmit}
        />
      )}
    </>
  );
} 