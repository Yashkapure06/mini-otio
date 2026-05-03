"use client";

import { useAppStore, Message } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { TypingIndicator } from "@/components/TypingIndicator";
import { RelatedQuestions } from "@/components/RelatedQuestions";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  StreamingTextOptimized,
  StreamingTextOptimizedRef,
} from "@/components/StreamingTextOptimized";
import { BookmarkModal } from "@/components/BookmarkModal";
import { SourceCitations } from "@/components/SourceCitations";
import {
  applyHighlightsToElement,
  addHighlightClickListener,
} from "@/lib/highlightUtils";
import { 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  ArrowDown, 
  Search, 
  FileText, 
  Zap,
  Globe,
  ArrowRight
} from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const ResearchProgress = () => (
  <div className="flex flex-col gap-4 py-8 animate-editorial">
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      <span className="text-sm font-serif italic text-[var(--primary)]">Synthesizing global perspectives...</span>
    </div>
    <div className="flex flex-col gap-3 pl-10 border-l border-[var(--hairline)] ml-3">
      {[
        { label: "Mapping digital knowledge", icon: Globe, status: "complete" },
        { label: "Authenticating research papers", icon: Search, status: "complete" },
        { label: "Extracting core insights", icon: FileText, status: "active" },
      ].map((step, i) => (
        <div key={i} className={cn("flex items-center gap-3 transition-all", step.status === "active" ? "opacity-100" : "opacity-40")}>
          <step.icon className={cn("h-4 w-4", step.status === "active" && "text-[var(--primary)] animate-pulse")} />
          <span className="text-[11px] font-bold uppercase tracking-widest">{step.label}</span>
          {step.status === "complete" && <Check className="h-3 w-3 text-[var(--accent-teal)]" />}
        </div>
      ))}
    </div>
  </div>
);

export function Chat() {
  const {
    messages,
    highlights,
    bookmarks,
    removeHighlight,
    isStreaming,
  } = useAppStore();

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedMessageForBookmark, setSelectedMessageForBookmark] =
    useState<Message | null>(null);
  const streamingRefs = useRef<Map<string, StreamingTextOptimizedRef>>(new Map());
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).__streamingRefs = streamingRefs.current;
  }, []);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((instant: boolean) => {
    const root = scrollRootRef.current;
    if (!root) return;
    root.scrollTo({ top: root.scrollHeight, behavior: instant ? "instant" : "smooth" });
  }, []);

  const handleScroll = () => {
    const root = scrollRootRef.current;
    if (!root) return;
    const isAtBottom = root.scrollHeight - root.scrollTop <= root.clientHeight + 100;
    setShowScrollButton(!isAtBottom);
  };

  useLayoutEffect(() => {
    scrollToBottom(true);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!isStreaming) return;
    const root = scrollRootRef.current;
    if (!root) return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { root.scrollTop = root.scrollHeight; });
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    schedule();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [isStreaming]);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isBookmarked = (messageId: string) => bookmarks.some((b) => b.messageId === messageId);

  const handleBookmark = (message: Message) => {
    setSelectedMessageForBookmark(message);
    setShowBookmarkModal(true);
  };

  useEffect(() => {
    if (highlights.length === 0) return;
    const ids = new Set(highlights.map((h) => h.messageId));
    ids.forEach((id) => {
      const el = document.querySelector(`[data-message-id="${id}"]`);
      if (el) {
        applyHighlightsToElement(el as HTMLElement, highlights, id);
        addHighlightClickListener(el as HTMLElement, removeHighlight);
      }
    });
  }, [highlights, removeHighlight]);

  return (
    <div 
      ref={scrollRootRef} 
      onScroll={handleScroll}
      className="h-full overflow-y-auto scrollbar-thin scroll-smooth relative bg-[var(--canvas)]"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-12 space-y-24">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            data-message-id={message.id}
            className={cn(
              "group animate-editorial",
              message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"
            )}
          >
            {/* USER MESSAGE - Editorial Box */}
            {message.role === "user" && (
              <div className="max-w-[85%] flex flex-col items-end gap-4">
                <div className="card-pro px-8 py-6 shadow-md border-[var(--hairline)] hover:border-[rgba(204,120,92,0.2)] transition-all">
                  <p className="text-xl font-bold text-[var(--ink)] leading-relaxed whitespace-pre-wrap font-serif italic">
                    {message.content}
                  </p>
                </div>
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all mr-2">
                  <button 
                    onClick={() => handleCopy(message.content, message.id)}
                    className="p-2 rounded-[var(--rounded-md)] hover:bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--ink)] transition-all"
                  >
                    {copiedMessageId === message.id ? <Check className="h-4 w-4 text-[var(--accent-teal)]" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
                    User Query <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                  </div>
                </div>
              </div>
            )}

            {/* ASSISTANT MESSAGE - Literary Layout */}
            {message.role === "assistant" && (
              <div className="w-full space-y-10">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="spike-mark bg-[var(--ink)] w-5 h-5 opacity-80" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-serif font-medium tracking-tight text-[var(--ink)]">Synthesis Engine</span>
                      <span className="text-[9px] font-bold text-[var(--muted-soft)] uppercase tracking-[0.2em] mt-0.5">Inference Node: {message.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  
                  {!message.isStreaming && (
                    <div className="px-3 py-1 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)]">
                      <span className="text-[9px] font-bold text-[var(--muted-soft)] uppercase tracking-widest">High Fidelity</span>
                    </div>
                  )}
                </div>

                <div className="relative pl-0 sm:pl-12">
                  <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-px bg-[var(--hairline)]" />
                  
                  {message.isStreaming ? (
                    <div className="space-y-8">
                      <ResearchProgress />
                      <StreamingTextOptimized
                        ref={(ref) => {
                          if (ref) streamingRefs.current.set(message.id, ref);
                          else streamingRefs.current.delete(message.id);
                        }}
                        content={message.content}
                        isStreaming={message.isStreaming}
                        highlights={highlights}
                        messageId={message.id}
                      />
                    </div>
                  ) : (
                    <MarkdownRenderer
                      content={message.content}
                      highlights={highlights}
                      messageId={message.id}
                      sources={message.sources || []}
                    />
                  )}

                  {/* Assistant Actions */}
                  {!message.isStreaming && (
                    <div className="flex flex-wrap items-center gap-6 mt-16 pt-8 border-t border-[var(--hairline)]">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="btn-secondary h-11 px-6 shadow-sm group"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-4 w-4 text-[var(--accent-teal)]" />
                          ) : (
                            <Copy className="h-4 w-4 text-[var(--muted-soft)] group-hover:text-[var(--ink)]" />
                          )}
                          <span>{copiedMessageId === message.id ? "Saved" : "Copy Finding"}</span>
                        </button>

                        <button
                          onClick={() => handleBookmark(message)}
                          className={cn(
                            "btn-secondary h-11 px-6 shadow-sm group",
                            isBookmarked(message.id) && "bg-[rgba(204,120,92,0.05)] border-[rgba(204,120,92,0.2)]"
                          )}
                        >
                          {isBookmarked(message.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-[#CC785C]" />
                          ) : (
                            <Bookmark className="h-4 w-4 text-[var(--muted-soft)] group-hover:text-[#CC785C]" />
                          )}
                          <span className={cn(isBookmarked(message.id) && "text-[#CC785C]")}>
                            {isBookmarked(message.id) ? "Insight Logged" : "Save Perspective"}
                          </span>
                        </button>
                      </div>

                      <div className="h-5 w-px bg-[var(--hairline)] hidden sm:block" />

                      <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[#CC785C] transition-all flex items-center gap-3 group">
                        Export as Research Report 
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}

                  {/* Sources & Related */}
                  {!message.isStreaming && (
                    <div className="space-y-16 mt-16">
                      {message.sources && message.sources.length > 0 && (
                        <div className="animate-editorial">
                          <SourceCitations sources={message.sources} />
                        </div>
                      )}
                      
                      <div className="animate-editorial">
                        <RelatedQuestions
                          messageId={message.id}
                          onQuestionClick={(question: string) => {
                            useAppStore.getState().setPendingQuery(question);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Scroll Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(false)}
          className="fixed bottom-60 left-1/2 -translate-x-1/2 z-50 bg-[var(--ink)] text-[var(--on-dark)] px-8 py-3.5 rounded-full flex items-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-white/10"
        >
          <ArrowDown className="h-4 w-4 group-hover:animate-bounce" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em]">New Findings Available</span>
        </button>
      )}

      {selectedMessageForBookmark && (
        <BookmarkModal
          isOpen={showBookmarkModal}
          onClose={() => {
            setShowBookmarkModal(false);
            setSelectedMessageForBookmark(null);
          }}
          content={selectedMessageForBookmark.content}
          messageId={selectedMessageForBookmark.id}
        />
      )}
    </div>
  );
}



