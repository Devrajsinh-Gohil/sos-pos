"use client";

import { useState } from "react";
import { EditableContentArea } from "./EditableContentArea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "../hooks/use-toast";

type Platform = "Facebook" | "Twitter" | "LinkedIn" | "Instagram";

const demoHashtags = {
  Facebook: ["socialMediaMarketing", "digitalContent", "brandStrategy"],
  Twitter: ["contentCreation", "socialMedia", "trending"],
  LinkedIn: ["professionalContent", "businessStrategy", "networking"],
  Instagram: ["instagramContent", "visualMarketing", "engagement"]
};

const PLATFORMS: Platform[] = ["Facebook", "Twitter", "LinkedIn", "Instagram"];

export default function ContentEditor() {
  const [contents, setContents] = useState<Record<Platform, string>>({
    Facebook: "",
    Twitter: "",
    LinkedIn: "",
    Instagram: ""
  });
  
  const [activeTab, setActiveTab] = useState<Platform>("Facebook");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock function to simulate AI content generation
  const generateContent = async (platform: Platform) => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate content",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock content based on platform
      let generatedContent = "";
      
      switch(platform) {
        case "Facebook":
          generatedContent = `📢 Excited to share our latest insights on ${topic}! \n\nOur team has been working hard to bring you the most up-to-date information on this trending topic. Check out our blog for the full article.\n\nWhat are your thoughts on ${topic}? Let us know in the comments below!`;
          break;
        case "Twitter":
          generatedContent = `Just published: Our latest research on ${topic} reveals surprising trends! Check it out here: example.com/link #${topic.replace(/\s+/g, '')}`;
          break;
        case "LinkedIn":
          generatedContent = `I'm pleased to announce our new professional insights on ${topic}.\n\n🔑 Key Takeaways:\n• Strategic opportunities in the ${topic} market\n• How industry leaders are approaching ${topic}\n• Future trends to watch\n\nWhat's your experience with ${topic}?`;
          break;
        case "Instagram":
          generatedContent = `✨ New content alert! ✨\n\nDiving deep into ${topic} today! Swipe to see all the amazing insights we've gathered.\n\nDouble tap if you want to learn more about ${topic}!`;
          break;
      }
      
      setContents(prev => ({
        ...prev,
        [platform]: generatedContent
      }));
      
      toast({
        title: "Content Generated",
        description: `${platform} content has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentChange = (platform: Platform, newContent: string) => {
    setContents(prev => ({
      ...prev,
      [platform]: newContent
    }));
  };

  const handleSave = (platform: Platform, content: string) => {
    // In a real app, you would save this to your backend
    console.log(`Saving ${platform} content:`, content);
    toast({
      title: "Content Saved",
      description: `Your ${platform} content has been saved.`,
    });
  };

  const generateAllContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate content",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      for (const platform of PLATFORMS) {
        await generateContent(platform);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="shadow-lg mb-8">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b">
          <CardTitle className="text-2xl">Social Media Content Editor</CardTitle>
          <CardDescription>
            Create and edit content for different social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Enter a topic for content generation"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={generateAllContent}
              disabled={isGenerating || !topic.trim()}
              className="flex items-center"
            >
              {isGenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate All Content
            </Button>
          </div>
          
          <Tabs 
            defaultValue="Facebook" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as Platform)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PLATFORMS.map(platform => (
                <TabsTrigger key={platform} value={platform}>
                  {platform}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {PLATFORMS.map(platform => (
              <TabsContent key={platform} value={platform}>
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                    onClick={() => generateContent(platform)}
                    className="flex items-center"
                  >
                    {isGenerating ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate {platform} Content
                  </Button>
                </div>
                
                <EditableContentArea
                  platform={platform}
                  initialContent={contents[platform]}
                  hashtags={demoHashtags[platform]}
                  onChange={(content) => handleContentChange(platform, content)}
                  onSave={(content) => handleSave(platform, content)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Content Preview</CardTitle>
          <CardDescription>
            See how your content will appear on social media
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab && contents[activeTab] ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md whitespace-pre-line">
              {contents[activeTab]}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Generate or enter content to see preview
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 