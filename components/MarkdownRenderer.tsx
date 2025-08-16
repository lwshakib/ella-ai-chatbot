"use client";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidChart from "./MermaidChart";

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
      <div className="flex items-center justify-between px-4 py-2 rounded-t-lg border">
        <span className="text-xs font-medium uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border hover:opacity-70 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
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
      <div className="rounded-b-lg border border-t-0 overflow-hidden">
        <pre
          {...props}
          className="text-xs font-mono p-4 overflow-x-auto scrollbar-thin"
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

const markdownComponents = {
  // Headings with better hierarchy and spacing
  h1: ({ node, ...props }: any) => (
    <h1
      {...props}
      className="text-sm lg:text-sm font-bold mt-2 mb-1 first:mt-0"
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2
      {...props}
      className="text-xs lg:text-xs font-bold mt-2 mb-1"
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      {...props}
      className="text-xs lg:text-xs font-bold mt-2 mb-1"
    />
  ),
  h4: ({ node, ...props }: any) => (
    <h4
      {...props}
      className="text-xs lg:text-xs font-semibold mt-2 mb-1"
    />
  ),
  h5: ({ node, ...props }: any) => (
    <h5
      {...props}
      className="text-xs font-semibold mt-1 mb-0.5"
    />
  ),
  h6: ({ node, ...props }: any) => (
    <h6
      {...props}
      className="text-xs font-semibold mt-1 mb-0.5"
    />
  ),

  // Enhanced paragraphs
  p: ({ node, ...props }: any) => (
    <p
      {...props}
      className="text-xs lg:text-xs leading-6 mb-2"
    />
  ),

  // Improved links with hover effects
  a: ({ node, ...props }: any) => (
    <a
      {...props}
      className="font-medium underline decoration-2 underline-offset-2 hover:opacity-70 transition-colors duration-200"
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
        className="px-1.5 py-0.5 rounded text-xs font-mono border mx-1"
      >
        {children}
      </code>
    );
  },

  // Better blockquotes
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      {...props}
      className="border-l-4 pl-3 pr-2 py-2 my-3 italic text-xs lg:text-xs rounded-r-lg leading-6"
    />
  ),

  // Enhanced lists
  ul: ({ node, ...props }: any) => (
    <ul
      {...props}
      className="list-disc list-outside pl-4 space-y-1 text-xs lg:text-xs mb-2"
    />
  ),
  ol: ({ node, ...props }: any) => (
    <ol
      {...props}
      className="list-decimal list-outside pl-4 space-y-1 text-xs lg:text-xs mb-2"
    />
  ),
  li: ({ node, ...props }: any) => <li {...props} className="leading-6" />,

  // Styled horizontal rule
  hr: ({ node, ...props }: any) => (
    <hr
      {...props}
      className="my-4 border-0 h-px opacity-30"
    />
  ),

  // Enhanced tables
  table: ({ node, ...props }: any) => {
    return (
      <div className="overflow-x-auto my-4 rounded-lg border shadow-sm">
        <table
          {...props}
          className="min-w-full divide-y"
          style={{ tableLayout: "auto" }}
        />
      </div>
    );
  },
  thead: ({ node, ...props }: any) => (
    <thead {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody {...props} className="divide-y" />
  ),
  tr: ({ node, ...props }: any) => (
    <tr
      {...props}
      className="hover:opacity-70 transition-colors duration-150"
    />
  ),
  th: ({ node, ...props }: any) => (
    <th
      {...props}
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b-2"
    />
  ),
  td: ({ node, ...props }: any) => (
    <td
      {...props}
      className="px-4 py-3 text-xs whitespace-nowrap"
    />
  ),

  // Responsive images
  img: ({ node, ...props }: any) => (
    <img
      {...props}
      className="max-w-full h-auto rounded-lg shadow-sm my-2 mx-auto block border"
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
}: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}