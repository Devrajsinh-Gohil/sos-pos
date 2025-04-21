"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { 
  loadData, 
  saveData, 
  clearData, 
  clearAllSocialData, 
  STORAGE_KEYS,
  getActiveStorage
} from "../lib/storage-service";
import { toast } from "../hooks/use-toast";

export default function TestStoragePage() {
  const [testContent, setTestContent] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);
  const [storageStatus, setStorageStatus] = useState<Record<string, string>>({});
  const [activeStorageType, setActiveStorageType] = useState("");
  
  // Ensure we're running on client side
  useEffect(() => {
    setIsBrowser(true);
    setActiveStorageType(getActiveStorage());
    
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
    
    checkStorageStatus();
  }, []);
  
  const checkStorageStatus = async () => {
    if (typeof window === 'undefined') return;
    
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
    setActiveStorageType(getActiveStorage());
  };
  
  const handleSaveTest = async () => {
    try {
      await saveData("test_content", testContent);
      toast({
        title: "Test Content Saved",
        description: `Content has been saved using ${getActiveStorage()}`,
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
  
  const handleClearAllSocialData = async () => {
    try {
      await clearAllSocialData();
      toast({
        title: "All Social Content Cleared",
        description: "All social media content has been removed from storage",
      });
      checkStorageStatus();
    } catch (error) {
      console.error("Error clearing all social content:", error);
      toast({
        title: "Error",
        description: "Failed to clear social content",
        variant: "destructive",
      });
    }
  };
  
  if (!isBrowser) {
    return <p>Loading...</p>;
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">localStorage Persistence Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Content Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Enter some test content here..."
              className="min-h-[150px]"
            />
            
            <div className="flex gap-2">
              <Button onClick={handleSaveTest}>
                Save Test Content
              </Button>
              
              <Button variant="outline" onClick={handleClearTest}>
                Clear Test Content
              </Button>
            </div>
            
            <div className="text-sm">
              <p>This content will persist even after page refresh.</p>
              <p>Try entering some text, saving it, and refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Storage Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-4 py-2 bg-muted rounded-md mb-2">
              <span className="font-medium">Active Storage: </span>
              <span className="font-mono">{activeStorageType}</span>
            </div>
            <div className="border rounded-md divide-y">
              {Object.entries(storageStatus).map(([key, status]) => (
                <div key={key} className="px-4 py-2 flex justify-between">
                  <span className="font-mono text-sm">{key}</span>
                  <span className={status === "Present" ? "text-green-600" : "text-gray-500"}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleClearAllSocialData}
              className="w-full"
            >
              Clear All Social Content Data
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Use this tool to verify that localStorage is working correctly.
              Clearing social content will reset all saved content on the main page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 