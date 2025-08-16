"use client";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Add this import
import MermaidChart from "./MermaidChart"; // Commented out for now

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const language = className?.replace("language-", "") || "text";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
      setCopied(false);
    }
  }, [code]);

  return (
    <div className="relative group my-6">
      {/* Header with language badge */}
      <div className="flex items-center justify-between bg-muted/50 dark:bg-muted/20 px-4 py-2 rounded-t-lg border border-border dark:border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-background dark:bg-background text-foreground rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          type="button"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="bg-card dark:bg-card rounded-b-lg border border-border dark:border-border border-t-0 overflow-hidden">
        <pre
          {...props}
          className="text-xs font-mono text-foreground p-4 overflow-x-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground hover:scrollbar-thumb-foreground"
        >
          <code className="block">{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: "default" | "user";
}

const markdownComponents = {
  // Headings with better hierarchy and spacing
  h1: ({ node, ...props }: any) => (
    <h1
      {...props}
      className="text-sm lg:text-sm font-bold text-foreground mt-2 mb-1 first:mt-0"
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2
      {...props}
      className="text-xs lg:text-xs font-bold text-foreground mt-2 mb-1"
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      {...props}
      className="text-xs lg:text-xs font-bold text-foreground mt-2 mb-1"
    />
  ),
  h4: ({ node, ...props }: any) => (
    <h4
      {...props}
      className="text-xs lg:text-xs font-semibold text-foreground mt-2 mb-1"
    />
  ),
  h5: ({ node, ...props }: any) => (
    <h5
      {...props}
      className="text-xs font-semibold text-foreground mt-1 mb-0.5"
    />
  ),
  h6: ({ node, ...props }: any) => (
    <h6
      {...props}
      className="text-xs font-semibold text-foreground mt-1 mb-0.5"
    />
  ),

  // Enhanced paragraphs
  p: ({ node, ...props }: any) => (
    <p
      {...props}
      className="text-xs lg:text-xs leading-6 text-foreground mb-2"
    />
  ),

  // Improved links with hover effects
  a: ({ node, ...props }: any) => (
    <a
      {...props}
      className="text-primary font-medium underline decoration-2 underline-offset-2 hover:text-primary/80 transition-colors duration-200"
    />
  ),

  // Enhanced code handling
  code: ({ node, inline, className, children, ...props }: any) => {
    if (className === "language-mermaid") {
      return <MermaidChart chartDefinition={children as string} />;
    }

    if (!inline && className?.startsWith("language-")) {
      return (
        <CodeBlock className={className} {...props}>
          {children}
        </CodeBlock>
      );
    }

    // Inline code
    return (
      <code
        {...props}
        className="bg-muted/50 text-foreground px-1.5 py-0.5 rounded text-xs font-mono border border-border mx-1"
      >
        {children}
      </code>
    );
  },

  // Better blockquotes
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      {...props}
      className="border-l-4 border-primary bg-primary/10 pl-3 pr-2 py-2 my-3 italic text-xs lg:text-xs text-foreground rounded-r-lg leading-6"
    />
  ),

  // Enhanced lists
  ul: ({ node, ...props }: any) => (
    <ul
      {...props}
      className="list-disc list-outside pl-4 space-y-1 text-xs lg:text-xs text-foreground mb-2"
    />
  ),
  ol: ({ node, ...props }: any) => (
    <ol
      {...props}
      className="list-decimal list-outside pl-4 space-y-1 text-xs lg:text-xs text-foreground mb-2"
    />
  ),
  li: ({ node, ...props }: any) => <li {...props} className="leading-6" />,

  // Styled horizontal rule
  hr: ({ node, ...props }: any) => (
    <hr
      {...props}
      className="my-4 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
    />
  ),

  // FIXED: Enhanced tables with better debugging and styling
  table: ({ node, ...props }: any) => {
    console.log("Table component rendering with props:", props);
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-border shadow-sm">
        <table
          {...props}
          className="min-w-full divide-y divide-border bg-background"
          style={{ tableLayout: "auto" }} // Ensure table layout works
        />
      </div>
    );
  },
  thead: ({ node, ...props }: any) => (
    <thead {...props} className="bg-muted/50" />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody {...props} className="bg-background divide-y divide-border" />
  ),
  tr: ({ node, ...props }: any) => (
    <tr
      {...props}
      className="hover:bg-muted/30 transition-colors duration-150"
    />
  ),
  th: ({ node, ...props }: any) => (
    <th
      {...props}
      className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b-2 border-border"
    />
  ),
  td: ({ node, ...props }: any) => (
    <td
      {...props}
      className="px-4 py-3 text-xs text-foreground whitespace-nowrap"
    />
  ),

  // Responsive images
  img: ({ node, ...props }: any) => (
    <img
      {...props}
      className="max-w-full h-auto rounded-lg shadow-sm my-2 mx-auto block border border-border"
    />
  ),

  // Media elements
  video: ({ node, ...props }: any) => (
    <video
      {...props}
      className="max-w-full h-auto rounded-lg shadow-sm my-2 mx-auto block"
      controls
    />
  ),
  audio: ({ node, ...props }: any) => (
    <audio {...props} className="w-full my-2" controls />
  ),
};

export default function MarkdownRenderer({
  content,
  className = "",
  variant = "default",
}: MarkdownRendererProps) {
  const textColor = variant === "user" ? "text-white" : "text-foreground";
  
  const userMarkdownComponents = {
    ...markdownComponents,
    // Override text colors for user messages
    h1: ({ node, ...props }: any) => (
      <h1
        {...props}
        className={`text-sm lg:text-sm font-bold ${textColor} mt-2 mb-1 first:mt-0`}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        {...props}
        className={`text-xs lg:text-xs font-bold ${textColor} mt-2 mb-1`}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        {...props}
        className={`text-xs lg:text-xs font-bold ${textColor} mt-2 mb-1`}
      />
    ),
    h4: ({ node, ...props }: any) => (
      <h4
        {...props}
        className={`text-xs lg:text-xs font-semibold ${textColor} mt-2 mb-1`}
      />
    ),
    h5: ({ node, ...props }: any) => (
      <h5
        {...props}
        className={`text-xs font-semibold ${textColor} mt-1 mb-0.5`}
      />
    ),
    h6: ({ node, ...props }: any) => (
      <h6
        {...props}
        className={`text-xs font-semibold ${textColor} mt-1 mb-0.5`}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p
        {...props}
        className={`text-xs lg:text-xs leading-6 ${textColor} mb-2`}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a
        {...props}
        className={`${variant === "user" ? "text-white/80" : "text-primary"} font-medium underline decoration-2 underline-offset-2 hover:${variant === "user" ? "text-white" : "text-primary/80"} transition-colors duration-200`}
      />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        {...props}
        className={`border-l-4 border-primary bg-primary/10 pl-3 pr-2 py-2 my-3 italic text-xs lg:text-xs ${textColor} rounded-r-lg leading-6`}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul
        {...props}
        className={`list-disc list-outside pl-4 space-y-1 text-xs lg:text-xs ${textColor} mb-2`}
      />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        {...props}
        className={`list-decimal list-outside pl-4 space-y-1 text-xs lg:text-xs ${textColor} mb-2`}
      />
    ),
    th: ({ node, ...props }: any) => (
      <th
        {...props}
        className={`px-4 py-3 text-left text-xs font-semibold ${textColor} uppercase tracking-wider border-b-2 border-border`}
      />
    ),
    td: ({ node, ...props }: any) => (
      <td
        {...props}
        className={`px-4 py-3 text-xs ${textColor} whitespace-nowrap`}
      />
    ),
  };

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={variant === "user" ? userMarkdownComponents : markdownComponents}
        remarkPlugins={[remarkGfm]} // CRITICAL: Add this for table support
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
