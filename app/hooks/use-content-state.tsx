"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { saveData, loadData, getActiveStorage, STORAGE_KEYS } from '../lib/storage-service';

// Type definitions for social media platforms
export type Platform = "Facebook" | "Twitter" | "LinkedIn" | "Instagram";
export type ContentState = Record<Platform, string>;
export type HashtagsState = Record<Platform, string[]>;

// Default values for state
const DEFAULT_CONTENT: ContentState = {
  Facebook: "",
  Twitter: "",
  LinkedIn: "",
  Instagram: ""
};

const DEFAULT_HASHTAGS: HashtagsState = {
  Facebook: [],
  Twitter: [],
  LinkedIn: [],
  Instagram: []
};

export interface ContentStateHook {
  // State values
  content: ContentState;
  hashtags: HashtagsState;
  activePlatform: Platform;
  topic: string;
  imageUrl: string;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  
  // Content management
  setContent: (platform: Platform, text: string) => void;
  setAllContent: (newContent: ContentState) => void;
  setHashtags: (platform: Platform, tags: string[]) => void;
  setAllHashtags: (newHashtags: HashtagsState) => void;
  setActivePlatform: (platform: Platform) => void;
  setTopic: (newTopic: string) => void;
  setImageUrl: (url: string) => void;
  
  // Persistence management
  saveContentState: () => Promise<boolean>;
  loadContentState: () => Promise<boolean>;
  resetContentState: () => void;
  
  // Helpers
  addHashtag: (platform: Platform, hashtag: string) => void;
  storageType: string;
}

/**
 * Custom hook for managing social content state with persistence
 */
export function useContentState(): ContentStateHook {
  // Core state
  const [content, setContentState] = useState<ContentState>(DEFAULT_CONTENT);
  const [hashtags, setHashtagsState] = useState<HashtagsState>(DEFAULT_HASHTAGS);
  const [activePlatform, setActivePlatformState] = useState<Platform>("Facebook");
  const [topic, setTopicState] = useState("");
  const [imageUrl, setImageUrlState] = useState("");
  
  // Status tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  const [storageType, setStorageType] = useState("initializing");
  
  // Load content state on initial mount
  useEffect(() => {
    if (!hasLoadedInitialState && typeof window !== 'undefined') {
      loadContentState().finally(() => {
        setIsLoading(false);
        setHasLoadedInitialState(true);
      });
      
      // Update storage type
      setStorageType(getActiveStorage());
    }
  }, [hasLoadedInitialState]);
  
  // Update content for a specific platform
  const setContent = useCallback((platform: Platform, text: string) => {
    setContentState(prev => {
      const newContent = { ...prev, [platform]: text };
      setHasUnsavedChanges(true);
      saveData(STORAGE_KEYS.SOCIAL_CONTENT, newContent);
      return newContent;
    });
  }, []);
  
  // Update all content at once
  const setAllContent = useCallback((newContent: ContentState) => {
    setContentState(newContent);
    setHasUnsavedChanges(true);
    saveData(STORAGE_KEYS.SOCIAL_CONTENT, newContent);
  }, []);
  
  // Update hashtags for a specific platform
  const setHashtags = useCallback((platform: Platform, tags: string[]) => {
    setHashtagsState(prev => {
      const newHashtags = { ...prev, [platform]: tags };
      setHasUnsavedChanges(true);
      saveData(STORAGE_KEYS.SOCIAL_HASHTAGS, newHashtags);
      return newHashtags;
    });
  }, []);
  
  // Update all hashtags at once
  const setAllHashtags = useCallback((newHashtags: HashtagsState) => {
    setHashtagsState(newHashtags);
    setHasUnsavedChanges(true);
    saveData(STORAGE_KEYS.SOCIAL_HASHTAGS, newHashtags);
  }, []);
  
  // Set active platform
  const setActivePlatform = useCallback((platform: Platform) => {
    setActivePlatformState(platform);
    saveData(STORAGE_KEYS.ACTIVE_PLATFORM, platform);
  }, []);
  
  // Set topic
  const setTopic = useCallback((newTopic: string) => {
    setTopicState(newTopic);
    saveData(STORAGE_KEYS.TOPIC, newTopic);
  }, []);
  
  // Set image URL
  const setImageUrl = useCallback((url: string) => {
    setImageUrlState(url);
    saveData(STORAGE_KEYS.IMAGE_URL, url);
  }, []);
  
  // Add a hashtag to content
  const addHashtag = useCallback((platform: Platform, hashtag: string) => {
    setContent(platform, 
      content[platform] + (content[platform].endsWith(" ") ? "" : " ") + 
      (hashtag.startsWith("#") ? hashtag : `#${hashtag}`)
    );
  }, [content, setContent]);
  
  // Save all content state
  const saveContentState = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Save all state
      await saveData(STORAGE_KEYS.SOCIAL_CONTENT, content);
      await saveData(STORAGE_KEYS.SOCIAL_HASHTAGS, hashtags);
      await saveData(STORAGE_KEYS.ACTIVE_PLATFORM, activePlatform);
      await saveData(STORAGE_KEYS.TOPIC, topic);
      await saveData(STORAGE_KEYS.IMAGE_URL, imageUrl);
      
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving content state:', error);
      toast({
        title: "Save Error",
        description: "Unable to save content state. Your changes might be lost when refreshing.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [content, hashtags, activePlatform, topic, imageUrl]);
  
  // Load all content state
  const loadContentState = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Load all state
      const loadedContent = await loadData<ContentState>(STORAGE_KEYS.SOCIAL_CONTENT, DEFAULT_CONTENT);
      const loadedHashtags = await loadData<HashtagsState>(STORAGE_KEYS.SOCIAL_HASHTAGS, DEFAULT_HASHTAGS);
      const loadedPlatform = await loadData<Platform>(STORAGE_KEYS.ACTIVE_PLATFORM, "Facebook");
      const loadedTopic = await loadData<string>(STORAGE_KEYS.TOPIC, "");
      const loadedImageUrl = await loadData<string>(STORAGE_KEYS.IMAGE_URL, "");
      
      setContentState(loadedContent);
      setHashtagsState(loadedHashtags);
      setActivePlatformState(loadedPlatform);
      setTopicState(loadedTopic);
      setImageUrlState(loadedImageUrl);
      
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error loading content state:', error);
      toast({
        title: "Load Error",
        description: "Unable to load previously saved content.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Reset content state to defaults
  const resetContentState = useCallback(() => {
    setContentState(DEFAULT_CONTENT);
    setHashtagsState(DEFAULT_HASHTAGS);
    setActivePlatformState("Facebook");
    setTopicState("");
    setImageUrlState("");
    setHasUnsavedChanges(false);
  }, []);
  
  return {
    // State values
    content,
    hashtags,
    activePlatform,
    topic,
    imageUrl,
    hasUnsavedChanges,
    isLoading,
    
    // Content management
    setContent,
    setAllContent,
    setHashtags,
    setAllHashtags,
    setActivePlatform,
    setTopic,
    setImageUrl,
    
    // Persistence management
    saveContentState,
    loadContentState,
    resetContentState,
    
    // Helpers
    addHashtag,
    storageType
  };
} 