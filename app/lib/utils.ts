import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a string to ensure it starts with a hashtag
 */
export function formatHashtag(tag: string): string {
  return tag.startsWith('#') ? tag : `#${tag}`;
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Creates a filename-safe string from a topic
 */
export function createSafeFilename(topic: string, extension: string): string {
  // Replace special characters and spaces with hyphens
  const safeString = topic
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .substring(0, 50); // Limit length
  
  return `${safeString}-${Date.now()}${extension}`;
}

/**
 * Determines if a request is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('rate limit');
  }
  return false;
}

/**
 * Delays execution for a specified time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 