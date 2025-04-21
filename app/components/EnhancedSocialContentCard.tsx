"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Copy, RefreshCw, Hash, Save, Trash2, AlertTriangle } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "../hooks/use-toast";
import { useContentState, Platform } from "../hooks/use-content-state";
import { Skeleton } from "../../components/ui/skeleton";
import { EditableContentArea } from "./EditableContentArea";

interface EnhancedSocialContentCardProps {
  onRegenerate?: (platform: Platform) => void;
  isRegenerating?: boolean;
}

export default function EnhancedSocialContentCard({
  onRegenerate,
  isRegenerating = false
}: EnhancedSocialContentCardProps) {
  const {
    content,
    hashtags,
    activePlatform,
    hasUnsavedChanges,
    isLoading,
    setContent,
    setActivePlatform,
    saveContentState,
    addHashtag,
    storageType
  } = useContentState();

  // Display storage type badge
  const getStorageTypeColor = () => {
    switch(storageType) {
      case 'indexeddb': return "bg-green-100 text-green-800 border-green-300";
      case 'localstorage': return "bg-blue-100 text-blue-800 border-blue-300";
      case 'sessionstorage': return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 'memory': return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied",
          description: "Content copied to clipboard",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const clearContent = (platform: Platform) => {
    if (window.confirm(`Are you sure you want to clear the ${platform} content?`)) {
      setContent(platform, "");
      
      toast({
        title: "Content Cleared",
        description: `${platform} content has been cleared.`,
      });
    }
  };
  
  const handlePublish = (platform: Platform) => {
    // This would be replaced with actual publishing logic
    toast({
      title: "Publishing Not Implemented",
      description: "This is a placeholder for the actual publishing functionality.",
    });
  };

  const getPlatformIcon = (platform: Platform) => {
    switch(platform) {
      case "Facebook": return <FaFacebook className="h-5 w-5 text-blue-600" />;
      case "Twitter": return <FaTwitter className="h-5 w-5 text-sky-500" />;
      case "LinkedIn": return <FaLinkedin className="h-5 w-5 text-blue-700" />;
      case "Instagram": return <FaInstagram className="h-5 w-5 text-pink-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl">Generated Content</CardTitle>
          <div className={`text-xs px-2 py-1 rounded border ${getStorageTypeColor()}`}>
            {storageType === 'memory' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
            {storageType}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => saveContentState()}
            className="flex items-center"
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activePlatform}
          onValueChange={(value) => setActivePlatform(value as Platform)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 gap-2 mb-4">
            {["Facebook", "Twitter", "LinkedIn", "Instagram"].map((platform) => (
              <TabsTrigger 
                key={platform} 
                value={platform}
                className="flex items-center justify-center gap-2"
              >
                {getPlatformIcon(platform as Platform)}
                <span className="hidden sm:inline">{platform}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {["Facebook", "Twitter", "LinkedIn", "Instagram"].map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-0">
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    {getPlatformIcon(platform as Platform)}
                    Connect {platform} →
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => copyToClipboard(content[platform as Platform])}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => clearContent(platform as Platform)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    
                    {onRegenerate && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => onRegenerate(platform as Platform)}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                    )}
                  </div>
                </div>
                
                <EditableContentArea
                  platform={platform as Platform}
                  content={content[platform as Platform]}
                  hashtags={hashtags[platform as Platform]}
                  onChange={(newContent) => setContent(platform as Platform, newContent)}
                  onAddHashtag={(hashtag) => addHashtag(platform as Platform, hashtag)}
                  placeholderText={`Enter your ${platform} content here...`}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 