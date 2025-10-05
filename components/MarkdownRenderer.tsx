"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // custom styling for different elements
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 mt-6 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 mt-5 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside text-slate-700 dark:text-slate-300 mb-4 space-y-2 pl-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside text-slate-700 dark:text-slate-300 mb-4 space-y-2 pl-6">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg">
              <div className="text-slate-600 dark:text-slate-400 italic">
                {children}
              </div>
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 border border-slate-700">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-500 hover:decoration-blue-500 dark:hover:decoration-blue-400 transition-colors"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-6 border-slate-200 dark:border-slate-700" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-600 dark:text-slate-400">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
