"use client";

import { useAppStore } from "@/lib/store";
import { X, Copy, Bookmark, BookmarkCheck, Eye, Zap } from "lucide-react";
import { useState } from "react";
import { BookmarkViewModal } from "@/components/BookmarkViewModal";
import { cn } from "@/lib/utils";

export function HighlightsSidebar() {
  const { highlights, bookmarks, removeHighlight, removeBookmark } =
    useAppStore();
  const [copiedHighlightId, setCopiedHighlightId] = useState<string | null>(
    null
  );
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  const handleCopy = async (text: string, highlightId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHighlightId(highlightId);
      setTimeout(() => setCopiedHighlightId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleViewBookmark = (bookmark: any) => {
    setSelectedBookmark(bookmark);
    setShowBookmarkModal(true);
  };

  return (
    <div className="w-85 h-full bg-[var(--canvas)] border-l border-[var(--hairline)] flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-4 w-4 text-[#CC785C]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Knowledge Vault</h3>
        </div>
        <h2 className="text-2xl font-serif text-[var(--ink)] leading-tight">
          Archives & <br />
          <span className="italic text-[#CC785C]">Curated Insights.</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
        {highlights.length === 0 && bookmarks.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-[var(--surface-soft)] rounded-full flex items-center justify-center mx-auto border border-[var(--hairline)]">
              <Zap className="h-6 w-6 text-[var(--muted-soft)]" />
            </div>
            <div className="space-y-2">
              <p className="text-[14px] font-serif italic text-[var(--muted)]">
                The vault is currently empty.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-soft)]">
                Highlight text to save insights.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-soft)]">Saved Reports</span>
                  <span className="text-[10px] font-bold text-[#CC785C]">{bookmarks.length}</span>
                </div>
                <div className="space-y-3">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      onClick={() => handleViewBookmark(bookmark)}
                      className="card-pro p-5 cursor-pointer group hover:border-[#CC785C]/30"
                    >
                      <div className="flex flex-col gap-3">
                        <h4 className="text-[15px] font-serif font-medium text-[var(--ink)] line-clamp-2 group-hover:text-[#CC785C] transition-colors">
                          {bookmark.title}
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-[var(--muted-soft)] uppercase tracking-widest">
                            {bookmark.keyPoints.length} Points
                          </span>
                          <div className="w-1 h-1 rounded-full bg-[var(--hairline)]" />
                          <span className="text-[10px] font-bold text-[var(--muted-soft)] uppercase tracking-widest">
                            {new Date(bookmark.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights Section */}
            {highlights.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-soft)]">Annotated Fragments</span>
                  <span className="text-[10px] font-bold text-[#CC785C]">{highlights.length}</span>
                </div>
                <div className="space-y-3">
                  {highlights.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="card-pro p-5 group relative"
                    >
                      <p className="text-[14px] font-serif italic leading-relaxed text-[var(--body)] mb-4">
                        "{highlight.text}"
                      </p>
                      <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-3">
                        <span className="text-[9px] font-bold text-[var(--muted-soft)] uppercase tracking-widest">
                           {new Date(highlight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(highlight.text, highlight.id)}
                            className="p-1.5 hover:bg-[var(--surface-soft)] rounded text-[var(--muted)] hover:text-[#CC785C] transition-colors"
                          >
                            {copiedHighlightId === highlight.id ? (
                              <span className="text-[9px] font-bold">COPIED</span>
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => removeHighlight(highlight.id)}
                            className="p-1.5 hover:bg-[var(--error)]/5 rounded text-[var(--muted)] hover:text-[var(--error)] transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BookmarkViewModal
        isOpen={showBookmarkModal}
        onClose={() => {
          setShowBookmarkModal(false);
          setSelectedBookmark(null);
        }}
        bookmark={selectedBookmark}
      />
    </div>
  );
}
