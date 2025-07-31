"use client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useMutation, useQuery } from "convex/react";
import {
  Copy,
  Download,
  Globe,
  Link,
  Loader2,
  Mic,
  Search,
  Send,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Message interfaces defining the structure of chat messages
interface BaseMessage {
  _id: string;
  _creationTime: number;
  clerkId: string;
  conversationId: string;
  sender: "user" | "ella";
  status: string;
  text?: string;
  type: string;
}

interface TextMessage extends BaseMessage {
  type: "text";
  text: string;
}

interface WebMessage extends BaseMessage {
  type: "web";
  text: string;
  images?: Array<{
    url: string;
    description?: string;
  }>;
  resources?: Array<{
    url: string;
    favicon: string;
  }>;
}

interface ImageMessage extends BaseMessage {
  type: "image";
  text?: string;
  imageUrl?: string;
}

type Message = TextMessage | WebMessage | ImageMessage;

// Type guards
const isWebMessage = (message: any): message is WebMessage => {
  return message.type === "web";
};

const isImageMessage = (message: any): message is ImageMessage => {
  return message.type === "image";
};

// Centralized error handler
const useErrorHandler = () => {
  return useCallback((error: any) => {
    let errorMessage = "An error occurred while sending your message.";
    if (error?.message) {
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError?.error?.code === 429) {
          errorMessage =
            "You've exceeded your daily quota for AI requests. Please try again tomorrow or upgrade your plan.";
        } else if (parsedError?.error?.message) {
          errorMessage = parsedError.error.message;
        }
      } catch {
        if (error.message.includes("quota") || error.message.includes("429")) {
          errorMessage =
            "You've exceeded your daily quota for AI requests. Please try again tomorrow or upgrade your plan.";
        } else {
          errorMessage = error.message;
        }
      }
    }
    toast.error(errorMessage, {
      duration: 5000,
      description:
        "Please try again later or contact support if the issue persists.",
    });
  }, []);
};

// Enhanced thinking indicator with web browser UI
const ThinkingIndicator = ({ type }: { type: string }) => {
  const getLoadingText = () => {
    switch (type) {
      case "text":
        return "Ella is thinking...";
      case "web":
        return "Ella is searching the web...";
      case "image":
        return "Ella is generating an image...";
      default:
        return "Ella is thinking...";
    }
  };

  // Special skeleton loading for image type
  if (type === "image") {
    return (
      <div className="flex justify-start">
        <div className="w-64 h-64 bg-muted-foreground/20 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground/60 text-sm">
            Generating image...
          </div>
        </div>
      </div>
    );
  }

  // Web browser loading UI for web search
  if (type === "web") {
    return (
      <div className="flex justify-start w-full">
        <div className="max-w-[80%] bg-muted rounded-2xl overflow-hidden">
          {/* Browser header */}
          <div className="bg-muted-foreground/10 px-4 py-2 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            {/* <div className="flex-1 mx-3">
              <div className="bg-background/50 rounded-full px-3 py-1 flex items-center space-x-2">
                <Search
                  size={12}
                  className="text-muted-foreground animate-spin"
                />
                <div className="text-xs text-muted-foreground">
                  Searching...
                </div>
              </div>
            </div> */}
            <Globe size={12} className="text-muted-foreground" />
          </div>

          {/* Browser content area */}
          <div className="p-4 space-y-3">
            {/* Search results skeleton */}
            <div className="space-y-2">
              <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-3/4"></div>
              <div className="h-2 bg-muted-foreground/20 rounded animate-pulse w-full"></div>
              <div className="h-2 bg-muted-foreground/20 rounded animate-pulse w-5/6"></div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-2/3"></div>
              <div className="h-2 bg-muted-foreground/20 rounded animate-pulse w-full"></div>
              <div className="h-2 bg-muted-foreground/20 rounded animate-pulse w-4/5"></div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-3/5"></div>
              <div className="h-2 bg-muted-foreground/20 rounded animate-pulse w-full"></div>
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin" />
                <span>Analyzing web results...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default thinking indicator
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-muted text-foreground flex flex-col items-start">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span className="text-sm font-medium">{getLoadingText()}</span>
        </div>
      </div>
    </div>
  );
};

// Masonry Gallery Component
const MasonryGallery = ({
  images,
}: {
  images: Array<{ url: string; description?: string }>;
}) => {
  return (
    <div className="max-w-lg columns-2 sm:columns-3 gap-1 space-y-1">
      {images.slice(0, 6).map((image, index) => (
        <div
          key={index}
          className="relative group cursor-pointer break-inside-avoid"
        >
          <div className="relative overflow-hidden rounded-md border border-border/50 bg-muted/30 hover:border-border transition-all duration-300 hover:shadow-lg">
            <Image
              src={image.url}
              alt={image.description || "Search result image"}
              width={75}
              height={75}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ aspectRatio: "auto" }}
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Description overlay */}
            {image.description && (
              <div className="absolute bottom-0 left-0 right-0 p-1 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-xs text-white text-center line-clamp-2 font-medium leading-tight">
                  {image.description}
                </p>
              </div>
            )}

            {/* Click indicator */}
            <div className="absolute top-1 right-1 w-4 h-4 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Link size={8} className="text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ConversationPage() {
  const params = useParams();
  const [textValue, setTextValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query the conversation to check if it exists
  const conversation = useQuery(api.functions.getConversation, {
    conversationId: params?.id as any,
  });

  const messages = useQuery(api.functions.getMessages, {
    conversationId: params?.id as string,
  });
  const { user } = useUser();
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const handleError = useErrorHandler();
  const createMessage = useMutation(api.functions.createMessage);

  // Check if conversation exists and has messages
  useEffect(() => {
    // Only check after both queries have loaded
    if (conversation !== undefined && messages !== undefined) {
      // If conversation doesn't exist, show not found
      if (!conversation) {
        notFound();
      }

      // If conversation exists but has no messages, show not found
      if (conversation && (!messages || messages.length === 0)) {
        notFound();
      }
    }
  }, [conversation, messages]);

  // Voice input handler
  const handleMicClick = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (!recognitionRef.current) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTextValue((prev) => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition error.");
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
    if (!isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  // Toggle resources expanded state
  const toggleResources = (messageId: string) => {
    setExpandedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Copy message content to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Message copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  // Download image
  const downloadImage = async (
    imageUrl: string,
    fileName: string = "generated-image"
  ) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = 24;
      const minHeight = 60;
      const maxHeight = 240;
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [textValue]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  // Handle keyboard events (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Validate message content before sending
  const validateMessage = (message: string): boolean => {
    if (!message.trim()) {
      toast.error("Please enter a message before sending.");
      return false;
    }

    if (message.length > 400) {
      toast.error("Message is too long. Please keep it under 400 characters.");
      return false;
    }

    return true;
  };

  const identifyTool = (message: string) => {
    const webTool = message.startsWith("/web");
    const imageTool = message.startsWith("/image");
    let toolRemovedMessage: string;

    if (webTool) {
      toolRemovedMessage = message.trim().slice(4);
      return { tool: "web", message: toolRemovedMessage };
    }
    if (imageTool) {
      toolRemovedMessage = message.trim().slice(6);
      return { tool: "image", message: toolRemovedMessage };
    }
    return { tool: "text", message };
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (textValue.trim() && !isSubmitting) {
      // Validate message before proceeding
      if (!validateMessage(textValue)) {
        return;
      }

      setIsSubmitting(true);
      const message = textValue.trim();

      setTextValue("");

      try {
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        createMessage({
          conversationId: params.id as any,
          text: message,
          type: "text",
          sender: "user",
          status: "completed",
          clerkId: user.id,
        });

        const { tool, message: textMessage } = identifyTool(message);
        const AIMessageId = await createMessage({
          conversationId: params?.id as any,
          text: "",
          type: tool,
          sender: "ella",
          status: "pending",
          clerkId: user?.id as string,
        });
        axios.post("/api/chat", {
          message: textMessage,
          conversationId: params.id,
          tool,
          AIMessageId,
        });
      } catch (error) {
        handleError(error);

        // Remove the user message from state if there was an error
        // setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Conversation content area with messages - takes remaining space */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto pb-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages &&
            messages.map((message: any) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Show typing indicator for pending messages, content for completed messages */}
                {message.status === "pending" ? (
                  <ThinkingIndicator type={message.type} />
                ) : message.sender === "ella" && message.type === "image" ? (
                  <div className="relative">
                    {/* Text content for image messages */}
                    {message.text && (
                      <div className="max-w-[80%] px-4 py-3 rounded-2xl text-foreground mb-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          <MarkdownRenderer content={message.text} />
                        </p>
                      </div>
                    )}

                    {/* Image display without card background */}
                    {isImageMessage(message) && message.imageUrl && (
                      <div className="relative">
                        <Image
                          src={message.imageUrl}
                          alt="Generated image"
                          width={300}
                          height={200}
                          className="w-full h-auto object-contain rounded-lg"
                        />

                        {/* Download button for image messages */}
                        <div className="absolute -bottom-8 left-2 flex space-x-2">
                          <button
                            onClick={() => downloadImage(message.imageUrl!)}
                            className="w-6 h-6 rounded-full transition-colors duration-200 text-secondary-foreground flex items-center justify-center shadow-sm bg-background/80 backdrop-blur-sm"
                            title="Download image"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {/* Resources section for web search results - floating outside card */}
                    {isWebMessage(message) &&
                      message.resources &&
                      message.resources.length > 0 && (
                        <div className="absolute -top-10 left-0 flex flex-wrap gap-2 mt-2">
                          {message.resources.map(
                            (
                              resource: { url: string; favicon: string },
                              index: number
                            ) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group hover:bg-muted/50 rounded-lg p-1 transition-colors duration-200 bg-background/80 backdrop-blur-sm border border-border/50"
                                title={resource.url}
                              >
                                <div className="w-5 h-5 rounded overflow-hidden border border-border/50 flex-shrink-0 bg-muted flex items-center justify-center">
                                  {resource.favicon ? (
                                    <Image
                                      src={resource.favicon}
                                      alt="Website favicon"
                                      width={20}
                                      height={20}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Hide the image and show a fallback icon
                                        e.currentTarget.style.display = "none";
                                        const parent =
                                          e.currentTarget.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-muted-foreground">
                                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                            </svg>
                                          `;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="w-3 h-3 text-muted-foreground"
                                    >
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                  )}
                                </div>
                              </a>
                            )
                          )}
                        </div>
                      )}

                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {/* Copy button for assistant messages - bottom left */}
                      {message.sender === "ella" &&
                        message.type !== "image" && (
                          <div className="absolute -bottom-8 left-2 flex space-x-2">
                            <button
                              onClick={() => copyMessage(message.text || "")}
                              className="w-6 h-6 rounded-full transition-colors duration-200 text-secondary-foreground flex items-center justify-center shadow-sm"
                              title="Copy message"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        )}

                      {/* Text content for all message types */}
                      {message.text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          <MarkdownRenderer content={message.text} />
                        </p>
                      )}

                      {/* Image display for image type messages */}
                      {isImageMessage(message) && message.imageUrl && (
                        <div className="mt-3">
                          <Image
                            src={message.imageUrl}
                            alt="Generated image"
                            width={300}
                            height={200}
                            className="w-full h-auto object-contain rounded-lg"
                          />
                        </div>
                      )}

                      {/* Web search results - images with masonry layout */}
                      {isWebMessage(message) &&
                        message.images &&
                        message.images.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <h4 className="text-sm font-semibold text-foreground">
                                Related Images
                              </h4>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {message.images.length} results
                              </span>
                            </div>
                            <MasonryGallery images={message.images} />
                            {message.images.length > 6 && (
                              <p className="text-xs text-muted-foreground mt-3">
                                Showing 6 of {message.images.length} images
                              </p>
                            )}
                          </div>
                        )}
                      {/* 
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p> */}
                    </div>
                  </div>
                )}
              </div>
            ))}

          {/* Remove the global typing indicator since it's now shown per message */}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed input field at bottom */}
      <div className="sticky bottom-0 bg-background  px-2 sm:px-4 py-2">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center bg-card border border-border rounded-xl shadow-lg">
          {/* Textarea with auto-resize */}
          <div className="w-full p-2">
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full min-h-[60px] max-h-[240px] text-foreground text-md placeholder:text-muted-foreground outline-none resize-none transition-all duration-200 ease-in-out bg-transparent"
              rows={1}
              aria-label="Message input"
              disabled={isSubmitting}
              maxLength={400} // Prevent extremely long messages
            />
          </div>

          {/* Character count and buttons */}
          <div className="w-full flex justify-between items-center p-2 pt-0">
            <div className="flex items-center space-x-2">
              {/* Character count */}
              {textValue.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {textValue.length}/400
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleMicClick}
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 transition-colors duration-200 text-secondary-foreground ${
                  isListening ? "ring-2 ring-primary" : ""
                }`}
                aria-label="Voice input"
                disabled={isSubmitting}
                title={
                  isListening ? "Listening... Click to stop" : "Voice input"
                }
              >
                <Mic
                  size={16}
                  className={isListening ? "animate-pulse text-primary" : ""}
                />
              </button>

              <button
                onClick={handleSubmit}
                disabled={!textValue.trim() || isSubmitting}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-primary hover:bg-primary/80 transition-colors duration-200 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
                title="Send message"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
