"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Protect, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Image as ImageIcon, Mic, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const MIN_HEIGHT = 48;
const MAX_HEIGHT = 164;

const AnimatedPlaceholder = ({
  showSearch,
  imageToolActive,
}: {
  showSearch: boolean;
  imageToolActive: boolean;
}) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={imageToolActive ? "image" : showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
      className="pointer-events-none w-[150px] text-sm absolute text-black/70 dark:text-white/70"
    >
      {imageToolActive
        ? "Describe the image..."
        : showSearch
          ? "Search the web..."
          : "Ask Ella AI..."}
    </motion.p>
  </AnimatePresence>
);

export default function AiInput({
  increaseWidth,
  activeTool,
}: {
  increaseWidth?: boolean;
  activeTool?: string;
}) {
  const [value, setValue] = useState("");
  const router = useRouter();
  const createConversation = useMutation(api.functions.createConversation);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  });
  const [showSearch, setShowSearch] = useState(false);
  const [imageToolActive, setImageToolActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { user } = useUser();
  const params = useParams();
  const recognitionRef = useRef<any>(null);
  const createMessage = useMutation(api.functions.createMessage);

  async function handleSubmission(message: string, tool: string) {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    createMessage({
      conversationId: params.id as any,
      text: message,
      type: "text",
      sender: "user",
      status: "completed",
      clerkId: user?.id as string,
    });
    const AIMessageId = await createMessage({
      conversationId: params?.id as any,
      text: "",
      type: tool,
      sender: "ella",
      status: "pending",
      clerkId: user?.id as string,
    });
    axios.post("/api/chat", {
      message: message,
      conversationId: params.id,
      tool,
      AIMessageId,
    });
  }

  const handleSubmit = async () => {
    if (!value.trim()) return;

    try {
      const tool = imageToolActive ? "image" : showSearch ? "web" : "text";
      if (params.id) {
        await handleSubmission(value, tool);
        setValue("");
        adjustHeight(true);
        setImageToolActive(false);
      } else {
        const conversationId = await createConversation();
        router.push(
          `/c/${conversationId}?message=${encodeURIComponent(value)}&tool=${encodeURIComponent(tool)}`
        );

        // Reset the input after successful submission
        setValue("");
        adjustHeight(true);
        setImageToolActive(false);
      }
    } catch (error) {
      console.error("Error submitting chat:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleMicClick = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.error("Speech recognition is not supported in this browser.");
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
        setValue((prev) => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        console.error("Voice recognition error.");
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

  const toggleImageTool = () => {
    const newImageToolActive = !imageToolActive;
    setImageToolActive(newImageToolActive);

    // Deactivate search tool when image tool is activated
    if (newImageToolActive) {
      setShowSearch(false);
    }
  };

  // Update internal state when activeTool changes
  useEffect(() => {
    if (activeTool === "search") {
      setShowSearch(true);
      setImageToolActive(false);
    } else if (activeTool === "image") {
      setShowSearch(false);
      setImageToolActive(true);
    } else {
      setShowSearch(false);
      setImageToolActive(false);
    }
  }, [activeTool]);

  return (
    <div className="w-full py-4">
      <div
        className={cn(
          "relative max-w-xl border rounded-[22px] border-black/5 p-1 w-full mx-auto",
          increaseWidth ? "max-w-4xl" : ""
        )}
      >
        <div className="relative rounded-2xl border border-black/5 bg-neutral-800/5 flex flex-col">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Textarea
                id="ai-input-04"
                value={value}
                placeholder=""
                className="w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white resize-none focus-visible:ring-0 leading-[1.2]"
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
              />
              {!value && (
                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder
                    showSearch={showSearch}
                    imageToolActive={imageToolActive}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              {/* Image Tool Button */}
              <Protect
                plan={"pro"}
                fallback={
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 bg-black/5 dark:bg-white/5 border-transparent text-black/20 dark:text-white/20 cursor-not-allowed"
                        >
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-4 h-4 text-inherit" />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Without pro access you can't access this tool</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                }
              >
                <button
                  type="button"
                  onClick={toggleImageTool}
                  className={cn(
                    "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                    imageToolActive
                      ? "bg-[#8b5cf6]/15 border-[#8b5cf6] text-[#8b5cf6]"
                      : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                  )}
                  title="Generate image with AI"
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <motion.div
                      animate={{
                        scale: imageToolActive ? 1.1 : 1,
                      }}
                      whileHover={{
                        scale: 1.1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                      }}
                    >
                      <ImageIcon
                        className={cn(
                          "w-4 h-4",
                          imageToolActive ? "text-[#8b5cf6]" : "text-inherit"
                        )}
                      />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {imageToolActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                          width: "auto",
                          opacity: 1,
                        }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm overflow-hidden whitespace-nowrap text-[#8b5cf6] flex-shrink-0"
                      >
                        Generate
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </Protect>

              <Protect
                plan={"pro"}
                fallback={
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 bg-black/5 dark:bg-white/5 border-transparent text-black/20 dark:text-white/20 cursor-not-allowed"
                        >
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-inherit" />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Without pro access you can't access this tool</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    const newShowSearch = !showSearch;
                    setShowSearch(newShowSearch);

                    // Deactivate image tool when search tool is activated
                    if (newShowSearch) {
                      setImageToolActive(false);
                    }
                  }}
                  className={cn(
                    "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                    showSearch
                      ? "bg-[#8b5cf6]/15 border-[#8b5cf6] text-[#8b5cf6]"
                      : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                  )}
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <motion.div
                      animate={{
                        rotate: showSearch ? 180 : 0,
                        scale: showSearch ? 1.1 : 1,
                      }}
                      whileHover={{
                        rotate: showSearch ? 180 : 15,
                        scale: 1.1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                      }}
                    >
                      <Globe
                        className={cn(
                          "w-4 h-4",
                          showSearch ? "text-[#8b5cf6]" : "text-inherit"
                        )}
                      />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {showSearch && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                          width: "auto",
                          opacity: 1,
                        }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm overflow-hidden whitespace-nowrap text-[#8b5cf6] flex-shrink-0"
                      >
                        Search
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </Protect>

              {/* Microphone Button */}
              <button
                type="button"
                onClick={handleMicClick}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                  isListening
                    ? "bg-red-500/15 border-red-500 text-red-500"
                    : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
                title="Voice input"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      scale: isListening ? 1.2 : 1,
                    }}
                    whileHover={{
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Mic
                      className={cn(
                        "w-4 h-4",
                        isListening ? "text-red-500" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {isListening && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm overflow-hidden whitespace-nowrap text-red-500 flex-shrink-0"
                    >
                      Listening
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  value
                    ? "bg-[#8b5cf6]/15 text-[#8b5cf6]"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
