"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { 
  saveData, 
  loadData, 
  clearData, 
  clearAllSocialData, 
  STORAGE_KEYS,
  getActiveStorage,
  isStorageAvailable,
  initStorage
} from "../lib/storage-service";
import { toast } from "../hooks/use-toast";
import EnhancedSocialContentCard from "../components/EnhancedSocialContentCard";
import { Platform, useContentState } from "../hooks/use-content-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AlertTriangle, Check, Database, HardDrive, Server, Smartphone } from "lucide-react";

export default function StorageTestPage() {
  const [testContent, setTestContent] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);
  const [storageStatus, setStorageStatus] = useState<Record<string, string>>({});
  const [activeStorageType, setActiveStorageType] = useState("");
  const contentState = useContentState();
  
  // Ensure we're running on client side
  useEffect(() => {
    setIsBrowser(true);
    
    // Check storage status
    checkStorageStatus();
    
    // Load test content from storage
    try {
      loadData<string>("test_content", "").then(savedContent => {
        if (savedContent) {
          setTestContent(savedContent);
        }
      });
    } catch (error) {
      console.error("Error loading test content:", error);
    }
  }, []);
  
  const checkStorageStatus = async () => {
    if (typeof window === 'undefined') return;
    
    // Re-initialize storage to get the most current state
    await initStorage();
    setActiveStorageType(getActiveStorage());
    
    const status: Record<string, string> = {};
    
    // Check all storage keys
    for (const key of Object.values(STORAGE_KEYS)) {
      try {
        const value = await loadData(key, null);
        status[key] = value ? "Present" : "Not found";
      } catch (e) {
        status[key] = "Error accessing";
      }
    }
    
    setStorageStatus(status);
  };
  
  const handleSaveTest = async () => {
    try {
      await saveData("test_content", testContent);
      toast({
        title: "Test Content Saved",
        description: `Content saved using ${activeStorageType}`,
      });
      checkStorageStatus();
    } catch (error) {
      console.error("Error saving test content:", error);
      toast({
        title: "Error",
        description: "Failed to save test content",
        variant: "destructive",
      });
    }
  };
  
  const handleClearTest = async () => {
    try {
      await clearData("test_content");
      setTestContent("");
      toast({
        title: "Test Content Cleared",
        description: "Test content has been removed from storage",
      });
      checkStorageStatus();
    } catch (error) {
      console.error("Error clearing test content:", error);
      toast({
        title: "Error",
        description: "Failed to clear test content",
        variant: "destructive",
      });
    }
  };
  
  const populateExampleContent = () => {
    const platform = contentState.activePlatform as Platform;
    let exampleContent = "";
    
    switch(platform) {
      case "Facebook":
        exampleContent = "✨ Just launched a new product! Check out our website for more details. #ProductLaunch #Exciting";
        break;
      case "Twitter":
        exampleContent = "We're thrilled to announce our latest innovation - available now! Click the link in bio to learn more. #NewProduct #Innovation";
        break;
      case "LinkedIn":
        exampleContent = "I'm pleased to share that we've just released a groundbreaking new solution to help businesses streamline their operations.\n\nKey features include:\n• Enhanced productivity\n• Time savings\n• Cost reduction\n\nWho else is excited about the future of work? #BusinessInnovation #FutureOfWork";
        break;
      case "Instagram":
        exampleContent = "✨ New release alert! ✨\n\nWe've been working hard behind the scenes and we're finally ready to show you what we've been creating!\n\nDouble tap if you're as excited as we are!";
        break;
    }
    
    contentState.setContent(platform, exampleContent);
    
    toast({
      title: "Example Content Added",
      description: `Added example content for ${platform}`
    });
  };
  
  const getStorageIcon = (type: string) => {
    switch(type) {
      case 'indexeddb': return <Database className="h-5 w-5" />;
      case 'localstorage': return <HardDrive className="h-5 w-5" />;
      case 'sessionstorage': return <Server className="h-5 w-5" />;
      case 'memory': return <Smartphone className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };
  
  if (!isBrowser) {
    return <p>Loading...</p>;
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Enhanced Storage Test</h1>
      <p className="text-gray-500 mb-8">Test and verify the enhanced storage implementation with multiple fallbacks</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStorageIcon(activeStorageType)}
                <span className="ml-2">Storage Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">Active Storage</span>
                <span className="font-mono text-sm">{activeStorageType}</span>
              </div>
              
              <div className="border rounded-md divide-y">
                {Object.entries(storageStatus).map(([key, status]) => (
                  <div key={key} className="px-4 py-2 flex justify-between">
                    <span className="font-mono text-sm">{key.split('_').pop()}</span>
                    <span className={status === "Present" ? "text-green-600 flex items-center" : "text-gray-500"}>
                      {status === "Present" && <Check className="h-4 w-4 mr-1" />}
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="destructive" 
                onClick={() => {
                  clearAllSocialData();
                  contentState.resetContentState();
                  checkStorageStatus();
                }}
                className="w-full"
              >
                Clear All Social Content Data
              </Button>
              
              <Button 
                variant="outline" 
                onClick={checkStorageStatus}
                className="w-full"
              >
                Refresh Status
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Enter some test content here..."
                className="min-h-[150px]"
              />
              
              <div className="flex gap-2">
                <Button onClick={handleSaveTest} className="flex-1">
                  Save Test Content
                </Button>
                
                <Button variant="outline" onClick={handleClearTest} className="flex-1">
                  Clear Test Content
                </Button>
              </div>
              
              <div className="text-sm">
                <p>This content will persist even after page refresh if storage is working correctly.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-5">
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">Social Content Editor</TabsTrigger>
              <TabsTrigger value="help">Troubleshooting</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Demo Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Topic</label>
                      <div className="flex mt-1">
                        <Input 
                          value={contentState.topic}
                          onChange={(e) => contentState.setTopic(e.target.value)}
                          placeholder="Enter a topic..." 
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Image URL</label>
                      <div className="flex mt-1">
                        <Input 
                          value={contentState.imageUrl}
                          onChange={(e) => contentState.setImageUrl(e.target.value)}
                          placeholder="Enter an image URL..." 
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button onClick={populateExampleContent}>
                      Add Example Content for {contentState.activePlatform}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <EnhancedSocialContentCard />
              
              <div className="text-sm text-gray-500 px-4">
                <p>All content is automatically saved as you type. Try refreshing the page - your content should still be there.</p>
                <p>This component uses the new storage service with multiple fallback mechanisms.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="help">
              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">If content isn't persisting:</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Check which storage mechanism is active (displayed at the top)</li>
                      <li>If using "memory" storage, content will be lost on refresh (this is a fallback)</li>
                      <li>Try clearing browser site data and cookies if you're having issues</li>
                      <li>Check browser dev tools (F12) for any errors</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Storage Priority:</h3>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li><strong>IndexedDB</strong> - First choice, highest capacity</li>
                      <li><strong>localStorage</strong> - Second choice, widely supported</li>
                      <li><strong>sessionStorage</strong> - Third choice, cleared on tab close</li>
                      <li><strong>Memory</strong> - Last resort, cleared on refresh</li>
                    </ol>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      In private/incognito browsing modes, storage capabilities may be limited
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}