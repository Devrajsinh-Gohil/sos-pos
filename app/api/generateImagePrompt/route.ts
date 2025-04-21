import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { moderateInput, addSafetyGuidelines } from "../../lib/content-moderation";
import { fetchTrendingContentAndHashtags } from "../../lib/search-service";

// Configure the OpenAI API with your key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Maximum prompt length for DALL-E
const MAX_PROMPT_LENGTH = 950; // Leaving room for safety guidelines

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

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

    // Fetch trending content related to the topic for general inspiration
    // Using Instagram as reference since it's the most visually focused platform
    const trendingData = await fetchTrendingContentAndHashtags(topic, "Instagram");

    // Create a context-enhanced prompt with trending information
    const visualContext = trendingData.relevantContent 
      ? `\nCurrent visual trends: ${trendingData.relevantContent.split('.')[0]}.`
      : '';

    const systemPrompt = `You are an expert at creating CONCISE image prompts for AI image generators. 
Create a short but detailed image prompt (UNDER 150 WORDS) for the given topic.

Your prompt MUST:
- Be under 150 words total
- Describe composition, lighting, mood, colors
- Specify artistic style
- NOT include text in the image
- Be for a square (1:1) format
- Focus on quality over quantity${visualContext}

KEEP IT BRIEF. Output ONLY the prompt text itself.`;

    // Add safety guidelines
    const safeSystemPrompt = addSafetyGuidelines(systemPrompt);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: safeSystemPrompt },
        { role: "user", content: `Create a short (under 150 words) image prompt about: ${topic}` }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 250, // Limit token output
    });

    let promptText = completion.choices[0].message.content || "";
    
    // Ensure the prompt doesn't exceed maximum length
    if (promptText.length > MAX_PROMPT_LENGTH) {
      console.warn(`Prompt truncated from ${promptText.length} to ${MAX_PROMPT_LENGTH} characters`);
      promptText = promptText.substring(0, MAX_PROMPT_LENGTH);
    }

    return NextResponse.json({ promptText });
  } catch (error) {
    console.error("Error generating image prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate image prompt" },
      { status: 500 }
    );
  }
} 