/**
 * Enhanced Storage Service with multiple fallback options
 * Provides persistent storage with fallbacks in this order:
 * 1. IndexedDB (more storage capacity, better for large data)
 * 2. localStorage (widely supported, but limited storage)
 * 3. sessionStorage (temporary, cleared after browser closes)
 * 4. Memory (fallback when nothing else works, lost on refresh)
 */

import { toast } from "../hooks/use-toast";

// Keys for different stored data types
export const STORAGE_KEYS = {
  SOCIAL_CONTENT: 'social_content_data',
  SOCIAL_HASHTAGS: 'social_hashtags_data',
  IMAGE_URL: 'social_image_url',
  TOPIC: 'social_topic',
  ACTIVE_PLATFORM: 'social_active_platform',
  CONTENT_VERSION: 'social_content_version',
  CONTENT_TIMESTAMP: 'social_content_timestamp'
};

// Current version of the data structure - increment when structure changes
export const CURRENT_DATA_VERSION = '1.0.0';

// IndexedDB configuration
const DB_NAME = 'SocialContentDB';
const DB_VERSION = 1;
const STORE_NAME = 'content';

// In-memory fallback when all else fails
const memoryStore: Record<string, any> = {};

// Expiration time (24 hours in milliseconds)
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Storage types for tracking active storage mechanism
export type StorageType = 'indexeddb' | 'localstorage' | 'sessionstorage' | 'memory' | 'none';

// Track which storage mechanism is being used
let activeStorage: StorageType = 'none';

/**
 * Initialize the storage system and ensure the IndexedDB is set up
 */
export async function initStorage(): Promise<StorageType> {
  // Reset active storage
  activeStorage = 'none';
  
  // Try IndexedDB first
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const db = await openDatabase();
      if (db) {
        activeStorage = 'indexeddb';
        return activeStorage;
      }
    }
  } catch (error) {
    console.warn('IndexedDB initialization failed:', error);
  }
  
  // Try localStorage next
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      activeStorage = 'localstorage';
      return activeStorage;
    }
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
  
  // Try sessionStorage next
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      activeStorage = 'sessionstorage';
      return activeStorage;
    }
  } catch (error) {
    console.warn('sessionStorage not available:', error);
  }
  
  // Use memory storage as last resort
  activeStorage = 'memory';
  return activeStorage;
}

/**
 * Open the IndexedDB database
 */
async function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      resolve(null);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
}

/**
 * Save data using the best available storage mechanism
 */
export async function saveData<T>(key: string, data: T): Promise<boolean> {
  // Initialize storage if not already done
  if (activeStorage === 'none') {
    await initStorage();
  }
  
  // Save timestamp to determine expiration later
  const saveObj = {
    data,
    timestamp: new Date().getTime(),
    version: CURRENT_DATA_VERSION
  };
  
  // Try IndexedDB first
  if (activeStorage === 'indexeddb') {
    try {
      const db = await openDatabase();
      if (db) {
        await saveToIndexedDB(db, key, saveObj);
        return true;
      }
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      // Fall through to next option
    }
  }
  
  // Try localStorage
  if (activeStorage === 'localstorage' || activeStorage === 'indexeddb') {
    try {
      const serialized = JSON.stringify(saveObj);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Fall through to next option
    }
  }
  
  // Try sessionStorage
  if (activeStorage === 'sessionstorage' || activeStorage === 'localstorage' || activeStorage === 'indexeddb') {
    try {
      const serialized = JSON.stringify(saveObj);
      sessionStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
      // Fall through to next option
    }
  }
  
  // Use memory as last resort
  memoryStore[key] = saveObj;
  return true;
}

/**
 * Save to IndexedDB
 */
function saveToIndexedDB(db: IDBDatabase, key: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({ key, ...data });
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event);
  });
}

/**
 * Load data using the best available storage mechanism
 */
export async function loadData<T>(key: string, defaultValue: T): Promise<T> {
  // Initialize storage if not already done
  if (activeStorage === 'none') {
    await initStorage();
  }
  
  let savedData: any = null;
  
  // Try IndexedDB first
  if (activeStorage === 'indexeddb') {
    try {
      const db = await openDatabase();
      if (db) {
        savedData = await loadFromIndexedDB(db, key);
      }
    } catch (error) {
      console.warn('Error loading from IndexedDB:', error);
      // Fall through to next option
    }
  }
  
  // Try localStorage if needed
  if (!savedData && (activeStorage === 'localstorage' || activeStorage === 'indexeddb')) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized) {
        savedData = JSON.parse(serialized);
      }
    } catch (error) {
      console.warn('Error loading from localStorage:', error);
      // Fall through to next option
    }
  }
  
  // Try sessionStorage if needed
  if (!savedData && (activeStorage === 'sessionstorage' || activeStorage === 'localstorage' || activeStorage === 'indexeddb')) {
    try {
      const serialized = sessionStorage.getItem(key);
      if (serialized) {
        savedData = JSON.parse(serialized);
      }
    } catch (error) {
      console.warn('Error loading from sessionStorage:', error);
      // Fall through to next option
    }
  }
  
  // Use memory as last resort
  if (!savedData && memoryStore[key]) {
    savedData = memoryStore[key];
  }
  
  if (savedData) {
    // Check for expired data
    const now = new Date().getTime();
    if (now - savedData.timestamp > EXPIRATION_TIME) {
      // Data expired, remove and return default
      clearData(key);
      return defaultValue;
    }
    
    // Check for data version mismatch
    if (savedData.version !== CURRENT_DATA_VERSION) {
      console.warn(`Data version mismatch. Expected ${CURRENT_DATA_VERSION}, got ${savedData.version}`);
      // Simple migration: try to use old data if it has the right shape
      try {
        // You can add migration logic here
        // For now, just return the data and hope it works
        return savedData.data;
      } catch (error) {
        console.error('Data migration failed:', error);
        clearData(key);
        return defaultValue;
      }
    }
    
    return savedData.data;
  }
  
  return defaultValue;
}

/**
 * Load from IndexedDB
 */
function loadFromIndexedDB(db: IDBDatabase, key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(key);
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = (event) => reject(event);
  });
}

/**
 * Clear specific data from all storage
 */
export async function clearData(key: string): Promise<void> {
  // Initialize storage if not already done
  if (activeStorage === 'none') {
    await initStorage();
  }
  
  // Try to clear from all possible storage mechanisms
  
  // IndexedDB
  try {
    const db = await openDatabase();
    if (db) {
      await clearFromIndexedDB(db, key);
    }
  } catch (error) {
    console.warn('Error clearing from IndexedDB:', error);
  }
  
  // localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Error clearing from localStorage:', error);
  }
  
  // sessionStorage
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Error clearing from sessionStorage:', error);
  }
  
  // Memory
  delete memoryStore[key];
}

/**
 * Clear from IndexedDB
 */
function clearFromIndexedDB(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event);
  });
}

/**
 * Clear all social content data from all storage mechanisms
 */
export async function clearAllSocialData(): Promise<void> {
  for (const key of Object.values(STORAGE_KEYS)) {
    await clearData(key);
  }
  
  toast({
    title: "Data Cleared",
    description: "All social content data has been removed.",
  });
}

/**
 * Get the current active storage mechanism
 */
export function getActiveStorage(): StorageType {
  return activeStorage;
}

/**
 * Check if storage is available at all
 */
export function isStorageAvailable(): boolean {
  return activeStorage !== 'none';
}

// Auto-initialize storage when module is loaded
if (typeof window !== 'undefined') {
  initStorage().then(storageType => {
    console.log(`Storage initialized: ${storageType}`);
  }).catch(error => {
    console.error('Storage initialization failed:', error);
  });
} 