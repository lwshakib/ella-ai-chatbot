"use client";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Mic, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const createConversation = useMutation(api.functions.createConversation);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textValue.trim()) {
      // Handle message submission
      handleMessageSubmission(textValue);
      setTextValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textValue.trim()) {
        // Handle message submission
        handleMessageSubmission(textValue);
        setTextValue("");
      }
    }
  };

  const handleMessageSubmission = async (message: string) => {
    const conversationId = await createConversation();
    router.push(`/c/${conversationId}`);
    axios.post("/api/chat", {
      message,
      conversationId,
    });
  };

  // Voice input handler
  const handleMicClick = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast &&
        toast.error &&
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
        toast && toast.error && toast.error("Voice recognition error.");
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

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-2xl flex flex-col items-center bg-card border border-border rounded-xl shadow-lg">
        {/* Textarea */}
        <div className="w-full p-4">
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            className="w-full min-h-[60px] max-h-[240px] text-foreground text-md placeholder:text-muted-foreground outline-none resize-none transition-all duration-200 ease-in-out bg-transparent"
            rows={1}
            aria-label="Message input"
          />
        </div>
        {/* Buttons */}
        <div className="w-full flex justify-end items-center px-4 pb-4 pt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMicClick}
              className={`flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 transition-colors duration-200 text-secondary-foreground ${
                isListening ? "ring-2 ring-primary" : ""
              }`}
              aria-label="Voice input"
              type="button"
              title={isListening ? "Listening... Click to stop" : "Voice input"}
            >
              <Mic
                size={16}
                className={isListening ? "animate-pulse text-primary" : ""}
              />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!textValue.trim()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary hover:bg-primary/80 transition-colors duration-200 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
