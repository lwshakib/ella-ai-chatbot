"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidChart from "./MermaidChart";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
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
    } catch (err) {
      console.error("Failed to copy code:", err);
      setCopied(false);
    }
  }, [code]);

  // Cleanup timeout on unmount
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="relative group my-1.5">
      {/* Header with language badge */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-lg border">
        <span className="text-xs font-medium uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border hover:opacity-70 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          type="button"
          aria-label={`Copy ${language} code to clipboard`}
          aria-pressed={copied}
        >
          {copied ? (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                aria-hidden="true"
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
      <div className="rounded-b-lg border border-t-0 overflow-hidden">
        <pre
          {...props}
          className="text-xs font-mono p-4 overflow-x-auto scrollbar-thin"
          role="region"
          aria-label={`${language} code block`}
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
}

// Memoized markdown components to prevent recreation on every render
const createMarkdownComponents = (): Components => ({
  // Headings with better hierarchy and spacing
  h1: ({ className, ...props }) => (
    <h1
      {...props}
      className={`text-sm lg:text-sm font-bold mt-1 mb-0 first:mt-0 ${className || ""}`}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      {...props}
      className={`text-xs lg:text-xs font-bold mt-1 mb-0 ${className || ""}`}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      {...props}
      className={`text-xs lg:text-xs font-bold mt-1 mb-0 ${className || ""}`}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      {...props}
      className={`text-xs lg:text-xs font-semibold mt-1 mb-0 ${className || ""}`}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      {...props}
      className={`text-xs font-semibold mt-0.5 mb-0 ${className || ""}`}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      {...props}
      className={`text-xs font-semibold mt-0.5 mb-0 ${className || ""}`}
    />
  ),

  // Enhanced paragraphs
  p: ({ className, ...props }) => (
    <p
      {...props}
      className={`text-xs lg:text-xs leading-4 mb-0.5 ${className || ""}`}
    />
  ),

  // Improved links with hover effects and security
  a: ({ href, className, ...props }) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        {...props}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`font-medium underline decoration-2 underline-offset-2 hover:opacity-70 transition-colors duration-200 ${className || ""}`}
      />
    );
  },

  // Enhanced code handling
  code: ({ className, children, ...props }: any) => {
    const codeString = String(children).replace(/\n$/, "");
    const inline = !className || !className.startsWith("language-");

    if (className === "language-mermaid") {
      return <MermaidChart chartDefinition={codeString} />;
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
        className={`px-1.5 py-0.5 rounded text-xs font-mono border mx-1 ${className || ""}`}
      >
        {children}
      </code>
    );
  },

  // Better blockquotes
  blockquote: ({ className, ...props }) => (
    <blockquote
      {...props}
      className={`border-l-4 pl-3 pr-2 py-1 my-1 italic text-xs lg:text-xs rounded-r-lg leading-4 ${className || ""}`}
    />
  ),

  // Enhanced lists
  ul: ({ className, ...props }) => (
    <ul
      {...props}
      className={`list-disc list-outside pl-4 space-y-0 text-xs lg:text-xs mb-0.5 ${className || ""}`}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      {...props}
      className={`list-decimal list-outside pl-4 space-y-0 text-xs lg:text-xs mb-0.5 ${className || ""}`}
    />
  ),
  li: ({ className, ...props }) => (
    <li {...props} className={`leading-4 ${className || ""}`} />
  ),

  // Styled horizontal rule
  hr: ({ className, ...props }) => (
    <hr
      {...props}
      className={`my-1 border-0 h-px opacity-30 ${className || ""}`}
    />
  ),

  // Enhanced tables
  table: ({ className, ...props }) => (
    <div className="overflow-x-auto my-1 rounded-lg border shadow-sm">
      <table
        {...props}
        className={`min-w-full divide-y ${className || ""}`}
        style={{ tableLayout: "auto" }}
        role="table"
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead {...props} className={className} />
  ),
  tbody: ({ className, ...props }) => (
    <tbody {...props} className={`divide-y ${className || ""}`} />
  ),
  tr: ({ className, ...props }) => (
    <tr
      {...props}
      className={`hover:opacity-70 transition-colors duration-150 ${className || ""}`}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      {...props}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b-2 ${className || ""}`}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      {...props}
      className={`px-4 py-3 text-xs whitespace-nowrap ${className || ""}`}
    />
  ),

  // Responsive images with error handling
  img: ({ src, alt, className, ...props }) => (
    <img
      {...props}
      src={src}
      alt={alt || "Image"}
      loading="lazy"
      className={`max-w-full h-auto rounded-lg shadow-sm my-0.5 mx-auto block border ${className || ""}`}
      onError={(e) => {
        // Fallback for broken images
        const target = e.currentTarget;
        target.style.display = "none";
      }}
    />
  ),

  // Media elements
  video: ({ className, ...props }) => (
    <video
      {...props}
      className={`max-w-full h-auto rounded-lg shadow-sm my-0.5 mx-auto block ${className || ""}`}
      controls
      preload="metadata"
    />
  ),
  audio: ({ className, ...props }) => (
    <audio
      {...props}
      className={`w-full my-0.5 ${className || ""}`}
      controls
      preload="metadata"
    />
  ),
});

function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Memoize components to prevent recreation
  const components = useMemo(() => createMarkdownComponents(), []);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(MarkdownRenderer);
