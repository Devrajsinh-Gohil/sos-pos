"use client";

import { useState, FormEvent, useCallback } from "react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { RefreshCw, Lightbulb, Copy, Hash, Download, Share } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "../hooks/use-toast";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import Link from "next/link";
import SocialContentCard from "./SocialContentCard";

type Platform = "Facebook" | "LinkedIn" | "Instagram";

type ContentState = Record<Platform, string>;
type HashtagsState = Record<Platform, string[]>;

const PLATFORMS: Platform[] = ["Facebook", "LinkedIn", "Instagram"];

const SocialMediaGenerator = () => {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState("");
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState("");
  const [isGeneratingImagePrompt, setIsGeneratingImagePrompt] = useState(false);
  const [content, setContent] = useState<ContentState>({
    Facebook: "",
    LinkedIn: "",
    Instagram: ""
  });
  const [hashtags, setHashtags] = useState<HashtagsState>({
    Facebook: [],
    LinkedIn: [],
    Instagram: []
  });
  const [activeTab, setActiveTab] = useState<Platform>("Facebook");
  const [isSendingToWebhook, setIsSendingToWebhook] = useState(false);

  const generateContent = useCallback(async (platform: Platform) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, platform }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setContent(prev => ({
          ...prev,
          [platform]: data.content
        }));
        
        if (data.usedHashtags && Array.isArray(data.usedHashtags)) {
          setHashtags(prev => ({
            ...prev,
            [platform]: data.usedHashtags
          }));
        }
        
        toast({
          title: "Content Generated",
          description: `${platform} content has been generated successfully.`,
        });
      } else {
        console.error("Error:", data.error);
        toast({
          title: "Content Policy Violation",
          description: data.error || "Failed to generate content",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const generateImagePrompt = useCallback(async () => {
    if (!topic.trim()) return;
    
    try {
      setIsGeneratingImagePrompt(true);
      const response = await fetch("/api/generateImagePrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      
      if (response.ok && data.promptText) {
        setGeneratedImagePrompt(data.promptText);
        setCustomImagePrompt(data.promptText);
        toast({
          title: "Image Prompt Generated",
          description: "A detailed image prompt has been created.",
        });
      } else {
        console.error("Error:", data.error);
        toast({
          title: "Content Policy Violation",
          description: data.error || "Failed to generate image prompt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating image prompt:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImagePrompt(false);
    }
  }, [topic]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied",
          description: "Text copied to clipboard",
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
  }, []);

  const generateImage = useCallback(async (customPrompt?: string) => {
    try {
      setIsGeneratingImage(true);
      const response = await fetch("/api/generateImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          topic: customPrompt || customImagePrompt || topic 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setImageUrl(data.imageUrl);
        toast({
          title: "Image Generated",
          description: "Image has been generated successfully.",
        });
      } else {
        console.error("Error:", data.error);
        toast({
          title: "Content Policy Violation",
          description: data.error || "Failed to generate image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [customImagePrompt, topic]);

  const generateAllContent = useCallback(async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      toast({
        title: "Generating Content",
        description: "Please wait while we generate content for all platforms...",
      });

      // First generate the image prompt
      try {
        await generateImagePrompt();
      } catch (error) {
        console.error("Error generating image prompt:", error);
      }

      // Generate content for all platforms
      for (const platform of PLATFORMS) {
        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ topic, platform }),
          });
          
          const data = await response.json();
          
          if (response.ok && data.content) {
            setContent(prev => ({
              ...prev,
              [platform]: data.content
            }));
            
            if (data.usedHashtags && Array.isArray(data.usedHashtags)) {
              setHashtags(prev => ({
                ...prev,
                [platform]: data.usedHashtags
              }));
            }
          } else {
            console.error(`Error generating content for ${platform}:`, data.error);
            toast({
              title: "Error",
              description: `Failed to generate content for ${platform}`,
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error(`Error generating content for ${platform}:`, err);
          toast({
            title: "Error",
            description: `Failed to generate content for ${platform}`,
            variant: "destructive",
          });
        }
      }

      // Generate image last
      try {
        await generateImage();
      } catch (error) {
        console.error("Error generating image:", error);
        toast({
          title: "Error",
          description: "Failed to generate image",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "All content has been generated successfully!",
      });
    } catch (error) {
      console.error("Error generating all content:", error);
      toast({
        title: "Error",
        description: "Failed to generate some content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [topic, generateImagePrompt, generateImage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    generateAllContent();
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "Facebook": return <FaFacebook className="h-5 w-5 text-blue-600" />;
      case "LinkedIn": return <FaLinkedin className="h-5 w-5 text-blue-800" />;
      case "Instagram": return <FaInstagram className="h-5 w-5 text-pink-600" />;
    }
  };

  const downloadImage = useCallback(async (url: string, filename: string) => {
    try {
      const downloadUrl = `/api/downloadImage?url=${encodeURIComponent(url)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Image download started",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  }, []);

  const addHashtagToContent = useCallback((platform: Platform, hashtag: string) => {
    const formattedHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    
    setContent(prev => ({
      ...prev,
      [platform]: prev[platform].trim() + ` ${formattedHashtag}`
    }));
    
    toast({
      title: "Hashtag Added",
      description: `Added ${formattedHashtag} to your ${platform} content`,
    });
  }, []);

  const handleTabChange = (platform: Platform) => {
    setActiveTab(platform);
  };

  const sendToWebhook = useCallback(async () => {
    try {
      setIsSendingToWebhook(true);
      
      const webhookUrl = "https://973c-103-90-44-124.ngrok-free.app/webhook-test/b0e7c950-4342-4e09-818f-51cb4b75d3c3";
      
      // Get the currently selected platform's data
      const selectedPlatform = activeTab; // This is the currently selected platform tab
      
      const platformData = {
        topic: topic,
        platform: selectedPlatform, // Use the selected platform
        content: content[selectedPlatform], // Get content for selected platform
        hashtags: hashtags[selectedPlatform] || [],
        imageUrl: imageUrl,
        timestamp: new Date().toISOString()
      };

      console.log(`Sending ${selectedPlatform} data to webhook:`, platformData);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(platformData)
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully sent to ${selectedPlatform}`,
          variant: "default",
          className: "bg-white text-black border border-gray-200",
          duration: 3000
        });
      } else {
        throw new Error(`Failed to send ${selectedPlatform} data to webhook (${response.status}): ${responseText}`);
      }

    } catch (error: any) {
      console.error("Webhook error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send data to webhook. Check console for details.",
        variant: "destructive",
        className: "bg-red-50 text-red-900 border border-red-200",
        duration: 3000
      });
    } finally {
      setIsSendingToWebhook(false);
    }
  }, [topic, activeTab, content, hashtags, imageUrl]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="mb-8 border-2 shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
          <CardTitle className="text-3xl font-bold text-center">Social Media Content Generator</CardTitle>
          <CardDescription className="text-center text-base">
            Generate optimized content for multiple social platforms with just one click
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-lg font-medium">
                Enter Topic
              </label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic for content generation"
                className="w-full p-3 text-base"
                required
              />
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <label htmlFor="imagePrompt" className="text-lg font-medium">
                  Image Prompt
                </label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={generateImagePrompt}
                    disabled={isGeneratingImagePrompt || !topic.trim()}
                  >
                    {isGeneratingImagePrompt ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lightbulb className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratingImagePrompt ? "Generating..." : "Get AI Suggestion"}
                  </Button>
                  {customImagePrompt && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(customImagePrompt)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                id="imagePrompt"
                value={customImagePrompt}
                onChange={(e) => setCustomImagePrompt(e.target.value)}
                placeholder="Optional: Describe the specific image you want, or use the AI to generate a detailed prompt"
                className="w-full min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                The image will be generated as a square illustration without text. Click "Get AI Suggestion" for a detailed prompt.
              </p>
            </div>
            <Button 
              type="submit" 
              variant="primary"
              size="xl"
              className="w-full mt-6 py-6 text-lg font-medium shadow-md hover:shadow-lg transition-all"
              disabled={isLoading || !topic.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate All Content"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="p-6 bg-gray-50 dark:bg-gray-900 border-t">
          <div className="flex w-full justify-between items-center">
            {/* Removed the connection message here */}
          </div>
        </CardFooter>
      </Card>

      {(content.Facebook || content.LinkedIn || content.Instagram || imageUrl) && (
        <div className="space-y-8">
          {/* Image and Content Section in a Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Section - Takes 4 columns on medium screens and up */}
            <div className="md:col-span-4">
              {imageUrl ? (
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                    <CardTitle className="text-lg font-medium">Image Preview</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(imageUrl, `${topic.substring(0, 20)}-image.png`)}
                        className="shadow-sm hover:text-foreground hover:bg-accent"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="overflow-hidden rounded-lg">
                      <img 
                        src={imageUrl} 
                        alt={`Generated image for ${topic}`} 
                        className="w-full h-auto object-cover max-h-[300px]"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => generateImage()} 
                        disabled={isGeneratingImage}
                        className="shadow-sm flex-1"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingImage ? "animate-spin" : ""}`} />
                        Regenerate Image
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : isGeneratingImage ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Generating Image...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full max-h-[300px]">
                      <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">No Image Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg h-[200px]">
                      <p className="text-muted-foreground text-center mb-4">Generate content first to see an image</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content Section - Takes 8 columns on medium screens and up */}
            <div className="md:col-span-8">
              {(content.Facebook || content.LinkedIn || content.Instagram) && (
                <SocialContentCard
                  initialContent={content}
                  hashtags={hashtags}
                  onRegenerate={(platform) => generateContent(platform)}
                  isRegenerating={isLoading}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onExport={sendToWebhook}
                  isExporting={isSendingToWebhook}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaGenerator; 