"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bookmark, X, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  messageId: string;
}

export function BookmarkModal({ isOpen, onClose, content, messageId }: BookmarkModalProps) {
  const { addBookmark } = useAppStore();
  const [title, setTitle] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    addBookmark({ title: title.trim(), content, keyPoints, messageId });
    onClose();
    setTitle("");
    setKeyPoints([]);
    setNewKeyPoint("");
  };

  const canSave = title.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[var(--canvas)] border border-[var(--hairline)] rounded-[var(--rounded-xl)] shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-[rgba(204,120,92,0.1)] border border-[rgba(204,120,92,0.2)] flex items-center justify-center">
              <Bookmark className="h-3.5 w-3.5 text-[#CC785C]" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Archive Synthesis</span>
          </div>
          <DialogTitle className="text-2xl font-serif text-[var(--ink)] leading-tight">
            Save <span className="italic text-[#CC785C]">Knowledge Bookmark.</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-soft)]">
              Title <span className="text-[#CC785C]">*</span>
            </label>
            <input
              autoFocus
              placeholder="e.g., Quantum Computing Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSave && handleSave()}
              className={cn(
                "w-full h-11 px-4 bg-white border rounded-[var(--rounded-md)] text-sm font-medium transition-all outline-none placeholder:text-[var(--muted-soft)]",
                title.trim()
                  ? "border-[#CC785C]/40 focus:border-[#CC785C]"
                  : "border-[var(--hairline)] focus:border-[#CC785C]"
              )}
            />
          </div>

          {/* Key Points */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-soft)]">
                Key Points
              </label>
              {keyPoints.length > 0 && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-soft)] bg-[var(--surface-soft)] px-2 py-0.5 rounded-full">
                  {keyPoints.length} added
                </span>
              )}
            </div>

            {keyPoints.length > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-none">
                {keyPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 px-4 py-3 bg-white border border-[var(--hairline)] rounded-[var(--rounded-md)] group hover:border-[rgba(204,120,92,0.2)] transition-all"
                  >
                    <div className="flex gap-2.5 min-w-0">
                      <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-[#CC785C] flex-shrink-0" />
                      <span className="text-[13px] font-serif italic text-[var(--body)] leading-snug">{point}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveKeyPoint(index)}
                      className="p-1 rounded hover:bg-[var(--error)]/5 text-[var(--muted-soft)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                placeholder="Add a synthesized point..."
                value={newKeyPoint}
                onChange={(e) => setNewKeyPoint(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyPoint()}
                className="flex-1 h-10 px-4 bg-white border border-[var(--hairline)] focus:border-[#CC785C] rounded-[var(--rounded-md)] text-sm outline-none transition-all placeholder:text-[var(--muted-soft)]"
              />
              <button
                onClick={handleAddKeyPoint}
                disabled={!newKeyPoint.trim()}
                className="h-10 w-10 flex items-center justify-center bg-[var(--ink)] hover:bg-[#CC785C] text-white rounded-[var(--rounded-md)] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-soft)]">Preview</label>
            <div className="p-4 bg-[var(--surface-soft)] rounded-[var(--rounded-md)] border border-[var(--hairline)] max-h-24 overflow-y-auto scrollbar-none">
              <p className="text-[11px] font-serif leading-relaxed text-[var(--muted)] italic line-clamp-3">
                {content.substring(0, 240)}{content.length > 240 ? "…" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-[var(--surface-soft)] border-t border-[var(--hairline)] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--ink)] rounded-[var(--rounded-md)] hover:bg-white/70 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="btn-primary h-10 px-8 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-[10px]"
          >
            Archive Insight
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
