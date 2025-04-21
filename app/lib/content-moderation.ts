import OpenAI from "openai";

// Initialize OpenAI only once with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * List of terms and topics that should be filtered from generation
 */
const BANNED_TERMS = [
  "porn", "pornography", "sexual", "nude", "naked",
  "explicit", "violence", "gore", "extremist", "terrorist",
  "racism", "hate speech", "harmful", "illegal", "drugs",
  "weapons", "self-harm", "suicide"
];

// Define return type for moderation
interface ModerationResult {
  isSafe: boolean;
  reason?: string;
}

/**
 * Local content check using regex patterns
 * @param input - Text to check
 * @returns Whether content passes basic checks
 */
function checkLocalContentPolicy(input: string): ModerationResult {
  const lowercaseInput = input.toLowerCase();
  
  for (const term of BANNED_TERMS) {
    if (lowercaseInput.includes(term)) {
      return { 
        isSafe: false, 
        reason: `Content contains potentially inappropriate term: ${term}` 
      };
    }
  }
  
  return { isSafe: true };
}

/**
 * Moderates input to prevent inappropriate prompts
 * @param input - Text to moderate
 * @returns Object containing safety status and reason if flagged
 */
export async function moderateInput(input: string): Promise<ModerationResult> {
  // First perform local check
  const localCheckResult = checkLocalContentPolicy(input);
  if (!localCheckResult.isSafe) {
    return localCheckResult;
  }

  try {
    // Use OpenAI's moderation API for thorough checking
    const moderation = await openai.moderations.create({ input });
    const result = moderation.results[0];

    if (result.flagged) {
      // Find which categories were flagged
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      return { 
        isSafe: false, 
        reason: `Content flagged for: ${flaggedCategories.join(", ")}` 
      };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("Moderation API error:", error);
    // If API fails, log but allow content to proceed with warning
    // This is a fallback to prevent complete system failure
    console.warn("Falling back to local content check due to API error");
    return { isSafe: true };
  }
}

/**
 * Adds safety guidelines to prompts to avoid harmful content
 * @param prompt - Original prompt
 * @returns Prompt with safety guidelines appended
 */
export function addSafetyGuidelines(prompt: string): string {
  const safetyGuidelines = `
IMPORTANT SAFETY GUIDELINES:
- Generate only appropriate, safe-for-work content
- Avoid controversial, political, or divisive topics
- Do not create content about harmful, illegal, or dangerous activities
- Ensure all content is professional and brand-safe
- Avoid anything that could be offensive to any group
- Focus on positive, constructive messaging`;

  return `${prompt.trim()}\n${safetyGuidelines}`;
} 