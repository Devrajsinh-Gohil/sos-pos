"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Copy, RefreshCw, Hash, Trash2, Share } from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "../hooks/use-toast";
import { saveData, loadData, clearData, STORAGE_KEYS } from "../lib/storage-service";

type Platform = "Facebook" | "LinkedIn" | "Instagram";

interface SocialContentCardProps {
  initialContent: Record<Platform, string>;
  hashtags: Record<Platform, string[]>;
  onRegenerate: (platform: Platform) => void;
  isRegenerating: boolean;
  activeTab: Platform;
  onTabChange: (platform: Platform) => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export default function SocialContentCard({
  initialContent,
  hashtags,
  onRegenerate,
  isRegenerating,
  activeTab,
  onTabChange,
  onExport,
  isExporting = false
}: SocialContentCardProps) {
  // Storage-related state
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  
  // Initialize state with initial props (will be replaced with storage data if available)
  const [content, setContent] = useState(initialContent);
  const [savedHashtags, setSavedHashtags] = useState(hashtags);

  // Add a ref to track user modifications
  const userModifiedRef = useRef(false);

  // Add a ref for the textarea
  const textareaRefs = useRef<Record<Platform, HTMLTextAreaElement | null>>({
    Facebook: null,
    LinkedIn: null,
    Instagram: null
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    // Run only on client-side and only once
    if (typeof window !== 'undefined' && !hasLoadedFromStorage) {
      try {
        // Load content
        loadData<Record<Platform, string>>(
          STORAGE_KEYS.SOCIAL_CONTENT,
          initialContent
        ).then(storedContent => {
          // Load hashtags
          loadData<Record<Platform, string[]>>(
            STORAGE_KEYS.SOCIAL_HASHTAGS,
            hashtags
          ).then(storedHashtags => {
            // Update state with stored values
            setContent(storedContent);
            setSavedHashtags(storedHashtags);
            
            setHasLoadedFromStorage(true);
          });
        });
      } catch (error) {
        console.error("Error loading from storage:", error);
        // Fallback to initial props
        setContent(initialContent);
        setSavedHashtags(hashtags);
        setHasLoadedFromStorage(true);
      }
    }
  }, [initialContent, hashtags, hasLoadedFromStorage]);

  // Update initialContent when props change and it's meaningful
  useEffect(() => {
    // Skip if user has modified content since last prop update
    if (userModifiedRef.current) {
      return;
    }
    
    // Only update from props if props have meaningful content and are different
    const propsHaveContent = Object.values(initialContent).some(text => text.trim().length > 0);
    
    // Check if props are different from current content
    const contentDiffers = Object.entries(initialContent).some(
      ([platform, text]) => text !== content[platform as Platform]
    );
    
    if (propsHaveContent && contentDiffers && hasLoadedFromStorage) {
      setContent(initialContent);
      setSavedHashtags(hashtags);
      
      // Save to storage
      saveData(STORAGE_KEYS.SOCIAL_CONTENT, initialContent);
      saveData(STORAGE_KEYS.SOCIAL_HASHTAGS, hashtags);
    }
  }, [initialContent, hashtags, hasLoadedFromStorage]);

  // Save active tab to storage when it changes
  useEffect(() => {
    if (hasLoadedFromStorage) {
      saveData(STORAGE_KEYS.ACTIVE_PLATFORM, activeTab);
    }
  }, [activeTab, hasLoadedFromStorage]);

  // Function to adjust textarea height
  const adjustTextareaHeight = (platform: Platform) => {
    const textarea = textareaRefs.current[platform];
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to match content (plus a small buffer)
    const newHeight = Math.max(textarea.scrollHeight + 2, 120); // Minimum height of 120px
    textarea.style.height = `${newHeight}px`;
  };

  // Adjust height when content changes or when platform tab changes
  useEffect(() => {
    if (activeTab) {
      setTimeout(() => adjustTextareaHeight(activeTab), 10);
    }
  }, [activeTab, content]);
  
  // Handle content change with storage persistence
  const handleContentChange = (platform: Platform, newContent: string) => {
    // Mark that user has modified content
    userModifiedRef.current = true;
    
    const updatedContent = {
      ...content,
      [platform]: newContent
    };
    
    setContent(updatedContent);
    
    // Auto-save to storage
    saveData(STORAGE_KEYS.SOCIAL_CONTENT, updatedContent);
    
    // Adjust height after content changes
    setTimeout(() => adjustTextareaHeight(platform), 0);
  };

  // Clear content for current platform
  const clearContent = (platform: Platform) => {
    if (window.confirm(`Are you sure you want to clear the ${platform} content?`)) {
      const updatedContent = {
        ...content,
        [platform]: ""
      };
      
      setContent(updatedContent);
      saveData(STORAGE_KEYS.SOCIAL_CONTENT, updatedContent);
      
      toast({
        title: "Content Cleared",
        description: `${platform} content has been cleared.`,
      });
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

  const addHashtag = (platform: Platform, hashtag: string) => {
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    const newContent = content[platform] + " " + tag;
    handleContentChange(platform, newContent);
  };

  const getPlatformIcon = (platform: Platform) => {
    switch(platform) {
      case "Facebook": return <FaFacebook className="h-5 w-5 text-blue-600" />;
      case "LinkedIn": return <FaLinkedin className="h-5 w-5 text-blue-700" />;
      case "Instagram": return <FaInstagram className="h-5 w-5 text-pink-600" />;
    }
  };

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-white dark:bg-gray-800">
        <CardTitle className="text-2xl font-bold">Generated Content</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs 
          defaultValue={activeTab} 
          className="w-full"
          value={activeTab}
          onValueChange={(value) => onTabChange(value as Platform)}
        >
          <TabsList className="w-full h-14 p-1 grid grid-cols-3 rounded-none bg-gray-50 dark:bg-gray-800 border-b">
            <TabsTrigger 
              value="Facebook" 
              className="flex items-center justify-center gap-2 rounded-md py-2.5 font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <FaFacebook className="h-5 w-5 text-blue-600" />
              Facebook
            </TabsTrigger>
            <TabsTrigger 
              value="LinkedIn" 
              className="flex items-center justify-center gap-2 rounded-md py-2.5 font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <FaLinkedin className="h-5 w-5 text-blue-700" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger 
              value="Instagram" 
              className="flex items-center justify-center gap-2 rounded-md py-2.5 font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
            >
              <FaInstagram className="h-5 w-5 text-pink-600" />
              Instagram
            </TabsTrigger>
          </TabsList>

          {Object.entries(content).map(([platform, platformContent]) => (
            <TabsContent key={platform} value={platform} className="mt-0 p-5 focus:outline-none">
              <div className="space-y-5">
                <div className="flex flex-wrap justify-end items-center gap-3 mb-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => copyToClipboard(platformContent)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => clearContent(platform as Platform)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    
                    {onRegenerate && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          // Reset user modification flag when regenerating
                          userModifiedRef.current = false;
                          onRegenerate(platform as Platform);
                        }}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                    )}
                    
                    {onExport && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={onExport}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Share className="h-4 w-4 mr-2" />
                        )}
                        {isExporting ? "Publishing..." : "Publish"}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    value={platformContent}
                    onChange={(e) => handleContentChange(platform as Platform, e.target.value)}
                    className="min-h-[150px] text-base p-4 bg-gray-50 dark:bg-gray-800 rounded-lg whitespace-pre-line overflow-hidden border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ref={(el) => { textareaRefs.current[platform as Platform] = el; }}
                    style={{ resize: 'none' }} // Disable manual resizing in favor of auto-resize
                    placeholder={`Enter your ${platform} content here...`}
                  />
                </div>
                
                {savedHashtags[platform as Platform] && savedHashtags[platform as Platform].length > 0 && (
                  <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-base font-medium">Trending Hashtags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {savedHashtags[platform as Platform].map((hashtag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm py-1.5 px-3 border shadow-sm transition-colors"
                          onClick={() => addHashtag(platform as Platform, hashtag)}
                        >
                          {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 