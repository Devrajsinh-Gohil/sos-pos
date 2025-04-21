"use client";

import { useState } from "react";
import { SocialPlatform } from "../lib/social-auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface PlatformCredentialsModalProps {
  platform: SocialPlatform;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentials: Record<string, string>) => void;
}

interface CredentialField {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  type?: string;
}

export default function PlatformCredentialsModal({
  platform,
  isOpen,
  onClose,
  onSubmit,
}: PlatformCredentialsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  // Define required credential fields for each platform
  const credentialFields: Record<SocialPlatform, CredentialField[]> = {
    facebook: [
      { id: "client_id", label: "App ID", placeholder: "Facebook App ID", required: true },
      { id: "client_secret", label: "App Secret", placeholder: "Facebook App Secret", required: true, type: "password" },
      { id: "redirect_uri", label: "Redirect URI", placeholder: "https://yourdomain.com/api/auth/callback/facebook", required: true },
    ],
    twitter: [
      { id: "client_id", label: "API Key", placeholder: "Twitter API Key (Client ID)", required: true },
      { id: "client_secret", label: "API Secret", placeholder: "Twitter API Secret (Client Secret)", required: true, type: "password" },
      { id: "redirect_uri", label: "Callback URL", placeholder: "https://yourdomain.com/api/auth/callback/twitter", required: true },
    ],
    linkedin: [
      { id: "client_id", label: "Client ID", placeholder: "LinkedIn Client ID", required: true },
      { id: "client_secret", label: "Client Secret", placeholder: "LinkedIn Client Secret", required: true, type: "password" },
      { id: "redirect_uri", label: "Redirect URL", placeholder: "https://yourdomain.com/api/auth/callback/linkedin", required: true },
    ],
    instagram: [
      { id: "client_id", label: "App ID", placeholder: "Instagram App ID", required: true },
      { id: "client_secret", label: "App Secret", placeholder: "Instagram App Secret", required: true, type: "password" },
      { id: "redirect_uri", label: "Redirect URI", placeholder: "https://yourdomain.com/api/auth/callback/instagram", required: true },
    ],
  };

  // Platform documentation links
  const documentationLinks: Record<SocialPlatform, string> = {
    facebook: "https://developers.facebook.com/docs/graph-api/",
    twitter: "https://developer.twitter.com/en/docs/twitter-api",
    linkedin: "https://developer.linkedin.com/docs",
    instagram: "https://developers.facebook.com/docs/instagram-api/",
  };

  const fields = credentialFields[platform] || [];

  const handleChange = (id: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate all required fields are filled
      const missingFields = fields
        .filter((field) => field.required && !credentials[field.id]?.trim())
        .map((field) => field.label);

      if (missingFields.length > 0) {
        toast({
          title: "Missing required fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Validate redirect URI format
      const redirectUri = credentials.redirect_uri?.trim();
      if (redirectUri && !redirectUri.startsWith('http')) {
        toast({
          title: "Invalid Redirect URI",
          description: "Redirect URI must be a valid URL starting with http:// or https://",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Prepare final credentials with trimmed values
      const trimmedCredentials = Object.fromEntries(
        Object.entries(credentials).map(([key, value]) => [key, value?.trim()])
      );

      // Submit credentials to the parent component
      onSubmit({
        ...trimmedCredentials,
        platform
      });
    } catch (error) {
      console.error(`Error submitting ${platform} credentials:`, error);
      toast({
        title: "Error",
        description: `Failed to save ${platform} credentials`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const getPlatformTitle = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect to {getPlatformTitle()}</DialogTitle>
          <DialogDescription>
            Enter your {getPlatformTitle()} developer credentials to connect your account.
            <a 
              href={documentationLinks[platform]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              View documentation
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.id} className="font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={field.id}
                placeholder={field.placeholder}
                className="w-full"
                value={credentials[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                type={field.type || "text"}
                required={field.required}
              />
              {field.id === "redirect_uri" && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground mt-1">
                    For local development, use: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">http://localhost:3000/api/auth/callback/{platform}</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For ngrok tunnels, use: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">https://your-tunnel-id.ngrok-free.app/api/auth/callback/{platform}</code>
                  </p>
                  <p className="text-xs text-amber-600 font-medium">
                    Important: No spaces or special characters in the URL. Must match exactly what's configured in your developer app.
                  </p>
                  {platform === 'instagram' && (
                    <p className="text-xs text-amber-600 font-medium mt-1">
                      For Instagram: Make sure to add this exact URL in both "Valid OAuth Redirect URIs" AND "Deauthorize Callback URL" fields in your Meta app settings.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mt-2">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> You need to create a developer application on the {getPlatformTitle()} developer platform.
              Remember to add the redirect URI to your app's allowed callback URLs.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            variant="primary" 
            className="min-w-[120px]"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 