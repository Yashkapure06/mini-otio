"use client";

import React, { memo, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface SourceCitation {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  relevanceScore: number;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highlights?: Array<{
    id: string;
    text: string;
    messageId: string;
  }>;
  messageId?: string;
  sources?: SourceCitation[];
}

const InlineCitation = ({
  index,
  source,
}: {
  index: number;
  source?: SourceCitation;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <span className="relative inline-block align-baseline">
      <button
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={() => setShowPreview(!showPreview)}
        className="mx-0.5 px-1.5 py-0.5 rounded-md bg-[rgba(204,120,92,0.08)] border border-[rgba(204,120,92,0.15)] text-[10px] font-bold text-[#CC785C] hover:bg-[#CC785C] hover:text-white transition-all duration-300 font-serif italic"
      >
        {index + 1}
      </button>
      {showPreview && source && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-white border border-[var(--hairline)] rounded-xl p-5 z-50 text-left shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-editorial">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#CC785C]" />
            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Primary Source Node</span>
          </div>
          <p className="text-[14px] font-serif font-medium text-[var(--ink)] line-clamp-2 mb-2 leading-snug">
            {source.title}
          </p>
          <p className="text-[9px] text-[#CC785C] font-bold uppercase tracking-widest truncate mb-3">{new URL(source.url).hostname}</p>
          
          <div className="flex items-center gap-3 pt-3 border-t border-[var(--hairline)]">
            <div className="h-1 flex-1 bg-[var(--surface-soft)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#CC785C] rounded-full"
                style={{ width: `${Math.min(100, source.relevanceScore * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-[var(--muted)] uppercase">
              {Math.round(source.relevanceScore * 100)}% Match
            </span>
          </div>
        </div>
      )}
    </span>
  );
};

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-serif font-medium text-[var(--ink)] mb-6 mt-10 first:mt-0 tracking-tight leading-tight">
      {props.children}
    </h1>
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-serif font-medium text-[var(--ink)] mb-5 mt-10 first:mt-0 tracking-tight">
      {props.children}
    </h2>
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-serif font-medium text-[var(--ink)] mb-4 mt-8 first:mt-0 tracking-tight">
      {props.children}
    </h3>
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[var(--ink)] font-medium leading-[1.8] mb-8 last:mb-0 text-[18px] opacity-100 block">
      {props.children}
    </p>
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside text-[var(--body)] mb-8 space-y-3 pl-6">
      {props.children}
    </ul>
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside text-[var(--body)] mb-8 space-y-3 pl-6">
      {props.children}
    </ol>
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-[var(--body)] leading-relaxed pl-2">{props.children}</li>
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-[var(--primary)] pl-8 py-2 my-8 italic font-serif text-xl text-[var(--muted)] bg-[rgba(204,120,92,0.05)] rounded-r-[var(--rounded-md)]">
      {props.children}
    </blockquote>
  ),
  code: (props: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
    const isInline = !props.className;
    if (isInline) {
      return (
        <code className="bg-[var(--surface-soft)] text-[var(--primary)] px-2 py-0.5 rounded-[var(--rounded-sm)] text-[0.9em] font-mono font-medium border border-[var(--hairline)]">
          {props.children}
        </code>
      );
    }
    return <code className={cn("font-mono text-[14px]", props.className)}>{props.children}</code>;
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-[var(--ink)] text-[var(--on-dark)] p-6 rounded-[var(--rounded-md)] overflow-x-auto my-8 border border-white/5 shadow-2xl scrollbar-thin">
      {props.children}
    </pre>
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--primary)] hover:text-[var(--primary-active)] underline decoration-[rgba(204,120,92,0.3)] hover:decoration-[var(--primary)] transition-all underline-offset-4"
    >
      {props.children}
    </a>
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-10 border border-[var(--hairline)] rounded-[var(--rounded-md)] shadow-sm">
      <table className="min-w-full border-collapse">
        {props.children}
      </table>
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[var(--surface-soft)] border-b border-[var(--hairline)]">{props.children}</thead>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest">
      {props.children}
    </th>
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-6 py-4 text-[15px] text-[var(--body)] border-b border-[var(--hairline)]">
      {props.children}
    </td>
  ),
  hr: () => <hr className="my-12 border-[var(--hairline)]" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-[var(--ink)]">{props.children}</strong>
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic font-serif text-[var(--muted)]">{props.children}</em>
  ),
};

export function MarkdownRenderer({
  content,
  className,
  highlights = [],
  messageId,
  sources = [],
}: MarkdownRendererProps) {
  const plugins = {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  };

  if (!content && sources.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Establishing Knowledge Nodes...</span>
      </div>
    );
  }

  return (
    <div className={cn("prose-editorial max-w-none animate-editorial min-h-[100px]", className)}>
      <ReactMarkdown {...plugins} components={markdownComponents}>
        {content || "_No content available for this node._"}
      </ReactMarkdown>

      {sources.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[var(--hairline)] animate-editorial">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-6 bg-[#CC785C] rounded-full" />
            <span className="text-[10px] font-bold text-[var(--ink)] uppercase tracking-[0.35em]">Verified Knowledge Nodes</span>
            <div className="flex-1 h-px bg-[var(--hairline)]" />
          </div>
          <div className="flex flex-wrap gap-4">
            {sources.map((source, i) => (
              <InlineCitation key={source.id} index={i} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

