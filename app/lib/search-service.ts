import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Interface for trending content data
 */
interface TrendingContentData {
  relevantContent: string;
  trendingHashtags: string[];
  error?: string;
}

/**
 * Parameters for the OpenAI function call
 */
interface TrendingContentParams {
  relevantContent: string;
  trendingHashtags: string[];
}

/**
 * Creates a system prompt for trending content search
 */
function createTrendingContentSystemPrompt(): string {
  return `You are a helpful assistant that provides accurate, up-to-date information about social media trends. 
When asked about trends, provide realistic, current trending content and hashtags for the specified platform.
Base your answers on general knowledge about what is typically popular and trending on these platforms.
For each platform, consider its unique format requirements and audience preferences.`;
}

/**
 * Creates a user prompt for trending content search
 */
function createTrendingContentUserPrompt(topic: string, platform: string): string {
  return `Find trending content and popular hashtags on ${platform} related to the topic: "${topic}".
          
For content examples, provide 2-3 brief examples of how similar content is currently being presented on ${platform}.
For hashtags, provide 10-15 relevant and popular hashtags that would work well for this topic on ${platform}.`;
}

/**
 * Fetches trending content and hashtags for a specific social media platform
 * @param topic - The topic to search for
 * @param platform - The social media platform
 * @returns Trending content data
 */
export async function fetchTrendingContentAndHashtags(
  topic: string,
  platform: string
): Promise<TrendingContentData> {
  try {
    // Using OpenAI's model with function calling to simulate web search
    // In a production environment, you would replace this with an actual API call to a search service
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: createTrendingContentSystemPrompt()
        },
        {
          role: "user",
          content: createTrendingContentUserPrompt(topic, platform)
        }
      ],
      functions: [
        {
          name: "get_trending_content",
          description: "Get trending content and hashtags for a social media platform",
          parameters: {
            type: "object",
            properties: {
              relevantContent: {
                type: "string",
                description: "2-3 examples of how similar content is currently being presented on the platform"
              },
              trendingHashtags: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "List of 10-15 relevant and trending hashtags for the topic on the platform"
              }
            },
            required: ["relevantContent", "trendingHashtags"]
          }
        }
      ],
      function_call: { name: "get_trending_content" }
    });

    const functionCall = completion.choices[0].message.function_call;
    
    if (functionCall && functionCall.name === "get_trending_content") {
      try {
        const args = JSON.parse(functionCall.arguments) as TrendingContentParams;
        return {
          relevantContent: args.relevantContent,
          trendingHashtags: args.trendingHashtags.map(tag => 
            tag.startsWith('#') ? tag : `#${tag}`
          ),
        };
      } catch (parseError) {
        console.error("Error parsing function call arguments:", parseError);
        return {
          relevantContent: "Error parsing trending content data.",
          trendingHashtags: [],
          error: "Data parsing error"
        };
      }
    }
    
    return {
      relevantContent: "No relevant content found.",
      trendingHashtags: [],
      error: "Failed to get trending content"
    };
  } catch (error) {
    console.error("Error fetching trending content:", error);
    return {
      relevantContent: "No relevant content found due to an error.",
      trendingHashtags: [],
      error: "Error connecting to search service"
    };
  }
}

/**
 * Enhances a content generation prompt with real-world examples and trending hashtags
 * @param basePrompt - The original prompt
 * @param trendingData - Trending content data
 * @returns Enhanced prompt with trending content
 */
export function enhancePromptWithTrendingContent(
  basePrompt: string,
  trendingData: TrendingContentData
): string {
  const { relevantContent, trendingHashtags } = trendingData;
  
  // Only add hashtags if they exist
  const hashtagsSection = trendingHashtags.length > 0 
    ? `\nCURRENT TRENDING HASHTAGS TO INCORPORATE WHERE APPROPRIATE:
${trendingHashtags.join(', ')}`
    : '';
  
  return `${basePrompt}

REAL-WORLD CONTENT EXAMPLES:
${relevantContent}
${hashtagsSection}

Use these real-world examples and trending hashtags as inspiration while maintaining your unique voice and perspective. Incorporate some of these trending hashtags where appropriate for the platform.`;
} 