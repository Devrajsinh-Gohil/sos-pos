import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { moderateInput, addSafetyGuidelines } from "../../lib/content-moderation";
import { fetchTrendingContentAndHashtags, enhancePromptWithTrendingContent } from "../../lib/search-service";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Define platform-specific prompt templates
const PLATFORM_PROMPTS = {
  Facebook: `You are a professional social media manager specializing in Facebook content. 
Create engaging, shareable Facebook content about the provided topic that is ready to publish.

Guidelines:
- Write in a conversational, friendly tone
- Ideal length: 1-3 short paragraphs (80-250 words)
- Include 1-2 relevant questions to encourage comments
- Add a clear call-to-action at the end
- Add 2-5 relevant hashtags at the end, not excessive
- Incorporate emoticons sparingly for a friendly feel
- Create content that encourages sharing and discussion
- Focus on storytelling and relatable content
- Avoid overly promotional language unless specifically requested

Your content should be ready to copy and paste directly to Facebook without any editing needed.`,

  LinkedIn: `You are a professional social media manager specializing in LinkedIn content.
Create professional, valuable LinkedIn content about the provided topic that is ready to publish.

Guidelines:
- Use a professional, authoritative tone
- Optimal length: 3-5 short paragraphs with line breaks (150-300 words)
- Start with a compelling hook/statistic/question
- Focus on industry insights, professional development, or business value
- Include 3-5 bullet points if presenting tips or steps
- Structure content with clear spacing for readability
- End with a thoughtful question to encourage comments
- Add 2-3 relevant hashtags at the end
- Avoid overly casual language or excessive emojis
- Maintain a thought leadership perspective

Your content should be ready to copy and paste directly to LinkedIn without any editing needed.`,

  Instagram: `You are a professional social media manager specializing in Instagram content.
Create visually descriptive, engaging Instagram caption content about the provided topic that is ready to publish.

Guidelines:
- Write in a vibrant, expressive style that complements visual content
- Optimal length: 2-4 paragraphs with line breaks (100-250 words)
- Begin with an attention-grabbing opening line
- Use vivid, descriptive language that helps create a visual image
- Include relevant emojis throughout (5-8 total) to enhance readability
- Add line breaks between paragraphs for easy mobile reading
- End with an engaging question or clear call-to-action
- Include 8-15 relevant hashtags grouped at the end, mixing popular and niche tags
- Consider including a location tag reference if relevant
- Write assuming the post will have an accompanying image

Your content should be ready to copy and paste directly to Instagram without any editing needed.`
};

/**
 * Handles the POST request to generate social media content
 */
export async function POST(request: NextRequest) {
  try {
    // Create a copy of the request body to avoid disturbing the original
    const body = await request.json();
    const { topic, platform } = body;

    // Validate required fields
    if (!topic || !platform) {
      return NextResponse.json(
        { error: "Topic and platform are required" },
        { status: 400 }
      );
    }

    // Validate platform
    if (!['Facebook', 'LinkedIn', 'Instagram'].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform specified" },
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

    // Fetch trending content and hashtags for the platform and topic
    const trendingData = await fetchTrendingContentAndHashtags(topic, platform);

    // Get the platform-specific prompt
    const systemPrompt = PLATFORM_PROMPTS[platform as keyof typeof PLATFORM_PROMPTS];
    
    // Enhance the prompt with trending content and hashtags
    const enhancedPrompt = enhancePromptWithTrendingContent(systemPrompt, trendingData);

    // Add safety guidelines to the enhanced prompt
    const safeSystemPrompt = addSafetyGuidelines(enhancedPrompt);

    // Generate content with OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: safeSystemPrompt },
        { role: "user", content: `Create ${platform} content about: ${topic}` }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;

    // Return generated content and hashtags
    return NextResponse.json({ 
      content,
      usedHashtags: trendingData.trendingHashtags
    });
  } catch (error) {
    console.error("Error generating content:", error);
    
    // Determine if it's a rate limit error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("rate limit") ? 429 : 500;
    
    return NextResponse.json(
      { error: status === 429 ? "Rate limit exceeded. Please try again later." : "Failed to generate content" },
      { status }
    );
  }
} 