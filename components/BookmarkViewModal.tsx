"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Bookmark, Copy, Check, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

interface BookmarkViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: {
    id: string;
    title: string;
    content: string;
    keyPoints: string[];
    messageId: string;
    timestamp: Date;
  } | null;
}

export function BookmarkViewModal({ isOpen, onClose, bookmark }: BookmarkViewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!bookmark) return;
    try {
      await navigator.clipboard.writeText(bookmark.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] bg-[var(--canvas)] border border-[var(--hairline)] rounded-[var(--rounded-xl)] shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-[var(--hairline)] bg-white/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[rgba(204,120,92,0.1)] border border-[rgba(204,120,92,0.2)] flex items-center justify-center">
              <Bookmark className="h-3.5 w-3.5 text-[#CC785C]" />
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
              <Calendar className="h-3 w-3" />
              <span>{new Date(bookmark.timestamp).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-serif text-[var(--ink)] leading-tight pr-8">
            {bookmark.title}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col sm:flex-row" style={{ maxHeight: "55vh" }}>
          {/* Key Points Panel */}
          {bookmark.keyPoints.length > 0 && (
            <div className="w-full sm:w-64 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-[var(--hairline)] bg-[var(--surface-soft)] p-6 overflow-y-auto scrollbar-none">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-soft)] mb-5">
                Synthesis Highlights
              </h3>
              <div className="space-y-4">
                {bookmark.keyPoints.map((point, index) => (
                  <div key={index} className="flex gap-3">
                    <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-[#CC785C] flex-shrink-0" />
                    <p className="text-[13px] font-serif italic text-[var(--body)] leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Content */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto scrollbar-none bg-white">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-soft)] mb-6">
              Full Analysis
            </h3>
            <div className="prose-editorial">
              <MarkdownRenderer content={bookmark.content} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-[var(--surface-soft)] border-t border-[var(--hairline)] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--ink)] rounded-[var(--rounded-md)] hover:bg-white/70 transition-all"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="btn-primary h-10 px-8 text-[10px]"
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy Full Text</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
