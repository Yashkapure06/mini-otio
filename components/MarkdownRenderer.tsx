"use client";

import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highlights?: Array<{
    id: string;
    text: string;
    messageId: string;
  }>;
  messageId?: string;
}

// Memoized markdown components to prevent re-renders
const markdownComponents = {
  h1: (props: any) => (
    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 mt-6 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2">
      {props.children}
    </h1>
  ),
  h2: (props: any) => (
    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6 first:mt-0">
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 mt-5 first:mt-0">
      {props.children}
    </h3>
  ),
  p: (props: any) => (
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 last:mb-0">
      {props.children}
    </p>
  ),
  ul: (props: any) => (
    <ul className="list-disc list-outside text-slate-700 dark:text-slate-300 mb-4 space-y-2 pl-6">
      {props.children}
    </ul>
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-outside text-slate-700 dark:text-slate-300 mb-4 space-y-2 pl-6">
      {props.children}
    </ol>
  ),
  li: (props: any) => (
    <li className="text-slate-700 dark:text-slate-300 leading-relaxed">
      {props.children}
    </li>
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg">
      <div className="text-slate-600 dark:text-slate-400 italic">
        {props.children}
      </div>
    </blockquote>
  ),
  code: (props: any) => {
    const isInline = !props.className;
    if (isInline) {
      return (
        <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono">
          {props.children}
        </code>
      );
    }
    return <code className={props.className}>{props.children}</code>;
  },
  pre: (props: any) => (
    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 border border-slate-700">
      {props.children}
    </pre>
  ),
  a: (props: any) => (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-500 hover:decoration-blue-500 dark:hover:decoration-blue-400 transition-colors"
    >
      {props.children}
    </a>
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg">
        {props.children}
      </table>
    </div>
  ),
  thead: (props: any) => (
    <thead className="bg-slate-50 dark:bg-slate-800">{props.children}</thead>
  ),
  th: (props: any) => (
    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
      {props.children}
    </th>
  ),
  td: (props: any) => (
    <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
      {props.children}
    </td>
  ),
  hr: () => <hr className="my-6 border-slate-200 dark:border-slate-700" />,
  strong: (props: any) => (
    <strong className="font-semibold text-slate-900 dark:text-slate-100">
      {props.children}
    </strong>
  ),
  em: (props: any) => (
    <em className="italic text-slate-600 dark:text-slate-400">
      {props.children}
    </em>
  ),
};

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
  highlights = [],
  messageId,
}: MarkdownRendererProps) {
  // memoize the plugins to prevent re-renders
  const plugins = useMemo(
    () => ({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    }),
    []
  );

  //  highlights for this specific message
  const messageHighlights = useMemo(() => {
    if (!messageId) return [];
    return highlights.filter((h) => h.messageId === messageId);
  }, [highlights, messageId]);

  // Memoize content to prevent unnecessary re-renders during streaming
  const memoizedContent = useMemo(() => content, [content]);

  // Simple wrapper component for highlighting
  const HighlightedText = ({ children }: { children: React.ReactNode }) => {
    return <span>{children}</span>;
  };

  // Updated components with highlighting support
  const componentsWithHighlights = useMemo(
    () => ({
      ...markdownComponents,
      p: (props: any) => (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 last:mb-0">
          <HighlightedText>{props.children}</HighlightedText>
        </p>
      ),
      li: (props: any) => (
        <li className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <HighlightedText>{props.children}</HighlightedText>
        </li>
      ),
      h1: (props: any) => (
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 mt-6 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2">
          <HighlightedText>{props.children}</HighlightedText>
        </h1>
      ),
      h2: (props: any) => (
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6 first:mt-0">
          <HighlightedText>{props.children}</HighlightedText>
        </h2>
      ),
      h3: (props: any) => (
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 mt-5 first:mt-0">
          <HighlightedText>{props.children}</HighlightedText>
        </h3>
      ),
      blockquote: (props: any) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg">
          <div className="text-slate-600 dark:text-slate-400 italic">
            <HighlightedText>{props.children}</HighlightedText>
          </div>
        </blockquote>
      ),
      strong: (props: any) => (
        <strong className="font-semibold text-slate-900 dark:text-slate-100">
          <HighlightedText>{props.children}</HighlightedText>
        </strong>
      ),
      em: (props: any) => (
        <em className="italic text-slate-600 dark:text-slate-400">
          <HighlightedText>{props.children}</HighlightedText>
        </em>
      ),
    }),
    [messageHighlights]
  );

  return (
    <div
      className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
    >
      <ReactMarkdown {...plugins} components={componentsWithHighlights}>
        {memoizedContent}
      </ReactMarkdown>
    </div>
  );
});
