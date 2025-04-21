import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { moderateInput, addSafetyGuidelines } from "../../lib/content-moderation";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Constants
const MAX_PROMPT_LENGTH = 1000;
const BRIEF_PROMPT_WORD_COUNT = 20;

/**
 * Prepares a prompt for image generation based on the input topic
 * @param topic - User's original input
 * @returns Formatted prompt for image generation
 */
function prepareImagePrompt(topic: string): string {
  const wordCount = topic.split(/\s+/).length;
  
  // For brief prompts, we add more detailed instructions
  if (wordCount < BRIEF_PROMPT_WORD_COUNT) {
    return `Create a visually stunning, professional square illustration related to: "${topic}".

IMPORTANT REQUIREMENTS:
- Clean, modern, artistic illustration style
- NO text, words, letters, or numbers in the image
- Suitable for social media marketing
- Vibrant, appealing color palette
- Square (1:1) format`;
  } 
  
  // For detailed prompts, just append critical requirements
  return `${topic}

CRITICAL: Square (1:1) aspect ratio. NO text, words, numbers, or letters.`;
}

/**
 * Handles the POST request to generate an image
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { topic } = await request.json();

    // Validate required fields
    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Moderate input to prevent inappropriate content
    const moderationResult = await moderateInput(topic);
    if (!moderationResult.isSafe) {
      return NextResponse.json(
        { error: "We cannot generate content for this topic due to content policy restrictions." },
        { status: 400 }
      );
    }

    // Prepare the prompt for image generation
    let promptToUse = prepareImagePrompt(topic);
    
    // Add safety guidelines
    promptToUse = addSafetyGuidelines(promptToUse);

    // Truncate to maximum allowed length
    if (promptToUse.length > MAX_PROMPT_LENGTH) {
      console.warn(`Prompt truncated from ${promptToUse.length} to ${MAX_PROMPT_LENGTH} characters`);
      promptToUse = promptToUse.substring(0, MAX_PROMPT_LENGTH);
    }

    // Generate image with OpenAI
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: promptToUse,
      n: 1,
      size: "1024x1024", // Ensures square image
      quality: "standard",
      style: "vivid", // More vibrant images
    });

    const imageUrl = response.data[0].url;

    // Return generated image URL
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    
    // Determine if it's a rate limit error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("rate limit") ? 429 : 500;
    
    return NextResponse.json(
      { error: status === 429 ? "Rate limit exceeded. Please try again later." : "Failed to generate image" },
      { status }
    );
  }
} 