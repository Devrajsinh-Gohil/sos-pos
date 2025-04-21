"use client";

import { useState } from 'react';
import SocialContentCard from '../components/SocialContentCard';
import { Button } from "../../components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "../hooks/use-toast";

type Platform = "Facebook" | "Twitter" | "LinkedIn" | "Instagram";

// Sample content for agriculture tech topic
const sampleContent = {
  Facebook: "🌾 Embrace the future of farming with cutting-edge technology! From drones monitoring crops to AI optimizing operations, agriculture is evolving. 🚜 #AgriTechRevolution #SmartFarming",
  Twitter: "⚡ Join the movement towards sustainable and efficient farming practices. Discover how technology is revolutionizing agriculture! 🌱 #AgricultureTech #AgriInnovation",
  LinkedIn: "👨‍🌾🌐 Interested in the intersection of agriculture and technology? Stay informed about the latest trends and innovations shaping the future of farming! 🌿 #AgTech #DigitalAgriculture",
  Instagram: "ℹ️ Learn more about how technology is reshaping the agricultural landscape. Like, retweet, and share to spread the word about the exciting advancements in agri-tech! 📱 #FutureOfFarming #PrecisionFarming"
};

// Sample hashtags
const sampleHashtags = {
  Facebook: ["AgricultureTech", "AgriTechRevolution", "FutureOfFarming", "AgriInnovation", "SmartFarming"],
  Twitter: ["AgTech", "DigitalAgriculture", "PrecisionFarming", "AgriTech"],
  LinkedIn: ["SustainableAgriculture", "FarmTech", "VerticalFarming"],
  Instagram: ["AInFarming", "ModernAgriculture"]
};

export default function SocialContentPage() {
  const [content, setContent] = useState(sampleContent);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const handleRegenerate = async (platform: Platform) => {
    setIsRegenerating(true);
    
    // Simulate regeneration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update content with slight modification to show change
    const newContent = {...content};
    newContent[platform] = content[platform] + " (Regenerated version)";
    setContent(newContent);
    
    toast({
      title: "Content Regenerated",
      description: `New ${platform} content has been generated.`,
    });
    
    setIsRegenerating(false);
  };

  const regenerateAllContent = async () => {
    setIsGeneratingAll(true);
    
    // Simulate regeneration for all platforms
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newContent = {
      Facebook: "📢 NEW: The agricultural revolution is happening now with smart farming technologies! See how drones, IoT sensors, and AI are transforming traditional farming into precision agriculture. #SmartFarming #AgTech",
      Twitter: "🌱 Smart farming is helping farmers increase yields by 20% while reducing water usage. The future of agriculture is tech-driven and sustainable! #AgriTech #SustainableFarming",
      LinkedIn: "I'm excited to share insights on how digital agriculture is transforming the industry:\n\n• 35% increase in crop yields\n• 40% reduction in water usage\n• 60% decrease in pesticide application\n\nThe business case for #AgTech is stronger than ever. #DigitalTransformation",
      Instagram: "✨ Farming reimagined through technology ✨\n\nSwipe to see how modern farmers are using drones, AI, and IoT to revolutionize agriculture. This isn't your grandparents' farm! #AgricultureTech #FarmingRevolution"
    };
    
    setContent(newContent);
    
    toast({
      title: "All Content Regenerated",
      description: "Fresh content has been generated for all platforms.",
    });
    
    setIsGeneratingAll(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex justify-center mb-6">
        <Button 
          onClick={regenerateAllContent} 
          disabled={isGeneratingAll}
          className="flex items-center px-6 py-6 text-lg"
          size="lg"
        >
          {isGeneratingAll ? (
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {isGeneratingAll ? "Generating..." : "Generate New Content"}
        </Button>
      </div>
      
      <SocialContentCard 
        initialContent={content}
        hashtags={sampleHashtags}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />
    </div>
  );
} 