"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Bold, Italic, List, Hash, Copy, Save } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { toast } from "../hooks/use-toast";
import { Platform } from "../hooks/use-content-state";

interface EditableContentAreaProps {
  platform: Platform;
  content: string;
  hashtags?: string[];
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  placeholderText?: string;
  onAddHashtag?: (hashtag: string) => void;
}

// Character limits for different platforms
const CHAR_LIMITS: Record<Platform, number> = {
  Facebook: 63206,  // Facebook post limit
  Twitter: 280,     // Twitter/X character limit
  LinkedIn: 3000,   // LinkedIn post limit
  Instagram: 2200,  // Instagram caption limit
};

export function EditableContentArea({
  platform,
  content = "",
  hashtags = [],
  onChange,
  onSave,
  readOnly = false,
  placeholderText = "Enter your content here...",
  onAddHashtag
}: EditableContentAreaProps) {
  const [charCount, setCharCount] = useState(content.length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(content.length);
    
    // Adjust textarea height when content changes
    if (textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCharCount(newContent.length);
    
    if (onChange) {
      onChange(newContent);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set the height to match content (plus a small buffer)
    const newHeight = Math.max(textarea.scrollHeight + 2, 120); // Minimum height of 120px
    textarea.style.height = `${newHeight}px`;
  };

  const insertFormatting = (format: string) => {
    if (readOnly || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = "";
    
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "list":
        formattedText = selectedText
          ? selectedText.split("\n").map(line => `• ${line}`).join("\n")
          : "• ";
        break;
      default:
        return;
    }
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    if (onChange) {
      onChange(newContent);
    }
    
    // Set focus back to textarea after inserting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };

  const addHashtag = (hashtag: string) => {
    if (readOnly) return;
    
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    
    if (onAddHashtag) {
      onAddHashtag(tag);
    } else if (onChange) {
      // Add space before hashtag if needed
      const newContent = content + (content.endsWith(" ") ? "" : " ") + tag;
      onChange(newContent);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast({
          title: "Copied",
          description: "Content copied to clipboard",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      toast({
        title: "Saved",
        description: `${platform} content has been saved.`,
      });
    }
  };

  const isOverLimit = charCount > CHAR_LIMITS[platform];

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{platform} Content</span>
          <span className={`text-sm font-normal ${isOverLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
            {charCount}/{CHAR_LIMITS[platform]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!readOnly && (
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertFormatting("bold")}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertFormatting("italic")}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertFormatting("list")}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder={placeholderText}
          className={`min-h-[150px] ${isOverLimit ? 'border-red-500' : ''} whitespace-pre-line overflow-hidden`}
          readOnly={readOnly}
          style={{ resize: 'none' }}
          onKeyUp={adjustTextareaHeight}
        />
        
        {isOverLimit && (
          <p className="text-red-500 text-xs mt-1">
            Content exceeds the maximum character limit for {platform}.
          </p>
        )}
        
        {hashtags && hashtags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-1 mb-2">
              <Hash className="h-4 w-4" />
              <span className="text-sm font-medium">Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((hashtag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`cursor-pointer hover:bg-accent ${readOnly ? '' : 'hover:shadow-sm'}`}
                  onClick={() => !readOnly && addHashtag(hashtag)}
                >
                  {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        {!readOnly && onSave && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isOverLimit}
            className="flex items-center"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 