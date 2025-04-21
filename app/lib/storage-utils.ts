/**
 * Utility functions for handling localStorage with type safety, error handling, and expiration
 */

// Keys for different stored data types
export const STORAGE_KEYS = {
  SOCIAL_CONTENT: 'social_content_data',
  SOCIAL_HASHTAGS: 'social_hashtags_data',
  ACTIVE_PLATFORM: 'social_active_platform',
  CONTENT_TIMESTAMP: 'social_content_timestamp'
};

// 24 hours in milliseconds
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

/**
 * Check if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    
    // Save timestamp for expiration check
    localStorage.setItem(
      `${key}_timestamp`,
      JSON.stringify(new Date().getTime())
    );
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Load data from localStorage with error handling and type safety
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue;
  
  try {
    // Check if data exists
    const serializedData = localStorage.getItem(key);
    if (!serializedData) {
      return defaultValue;
    }

    // Check expiration
    const timestampStr = localStorage.getItem(`${key}_timestamp`);
    if (timestampStr) {
      const timestamp = JSON.parse(timestampStr);
      const now = new Date().getTime();
      
      // If data is older than expiration time, return default
      if (now - timestamp > EXPIRATION_TIME) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
        return defaultValue;
      }
    }

    // Parse and return data
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Clear specific data from localStorage
 */
export function clearStorageItem(key: string): void {
  if (!isStorageAvailable()) return;
  
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
  } catch (error) {
    console.error(`Error clearing localStorage item (${key}):`, error);
  }
}

/**
 * Clear all social content related data from localStorage
 */
export function clearAllSocialContentData(): void {
  if (!isStorageAvailable()) return;
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    });
  } catch (error) {
    console.error('Error clearing all social content data:', error);
  }
} 