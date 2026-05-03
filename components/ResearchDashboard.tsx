"use client";

import { useAppStore } from "@/lib/store";
import { useState } from "react";
import {
  Globe,
  Zap,
  Bookmark,
  Database,
  TrendingUp,
  ArrowRight,
  Activity,
  Layers,
  ChevronRight,
  Calendar,
  FileText,
  BarChart2,
  Archive,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ArchivesView() {
  const { bookmarks, removeBookmark } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Archive className="h-6 w-6 text-white/20" />
        </div>
        <div className="space-y-2">
          <p className="text-[13px] font-serif italic text-white/40">
            No archived insights yet.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
            Save perspectives from any response.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {bookmarks.map((bk) => (
        <div
          key={bk.id}
          className="rounded-[var(--rounded-lg)] bg-white/5 border border-white/5 hover:border-[#CC785C]/30 transition-all overflow-hidden group"
        >
          {/* Header row */}
          <button
            onClick={() => setExpandedId(expandedId === bk.id ? null : bk.id)}
            className="w-full flex items-start gap-4 p-5 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#CC785C]/15 border border-[#CC785C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bookmark className="h-3.5 w-3.5 text-[#CC785C]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-serif font-medium text-white/80 leading-snug truncate">
                {bk.title}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/25">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(bk.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <span className="text-white/15">·</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                  {bk.keyPoints.length} point
                  {bk.keyPoints.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-white/20 flex-shrink-0 mt-1 transition-transform duration-200",
                expandedId === bk.id && "rotate-90 text-[#CC785C]",
              )}
            />
          </button>

          {/* Expanded content */}
          {expandedId === bk.id && (
            <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-5 animate-editorial">
              {bk.keyPoints.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                    Key Points
                  </p>
                  {bk.keyPoints.map((pt, i) => (
                    <div key={i} className="flex gap-3">
                      <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-[#CC785C] flex-shrink-0" />
                      <p className="text-[12px] font-serif italic text-white/60 leading-relaxed">
                        {pt}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleCopy(bk.content, bk.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-all"
                >
                  {copiedId === bk.id ? (
                    <>
                      <Check className="h-3 w-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => removeBookmark(bk.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MetricsView() {
  const { messages, highlights, bookmarks, chatSessions } = useAppStore();

  const totalSources = messages.reduce(
    (acc, msg) => acc + (msg.sources?.length || 0),
    0,
  );
  const totalChars = messages.reduce((acc, msg) => acc + msg.content.length, 0);

  const metrics = [
    {
      label: "Sources",
      value: totalSources,
      icon: Globe,
      sub: "Knowledge nodes",
      color: "text-[#CC785C]",
      bg: "bg-[#CC785C]/10 border-[#CC785C]/20",
    },
    {
      label: "Highlights",
      value: highlights.length,
      icon: Zap,
      sub: "Extracted insights",
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Bookmarks",
      value: bookmarks.length,
      icon: Bookmark,
      sub: "Saved perspectives",
      color: "text-teal-400",
      bg: "bg-teal-400/10 border-teal-400/20",
    },
    {
      label: "Density",
      value: (totalChars / 1000).toFixed(1) + "k",
      icon: Database,
      sub: "Chars synthesized",
      color: "text-white/50",
      bg: "bg-white/5 border-white/10",
    },
  ];

  const recentTopics = chatSessions
    .flatMap((s) => s.messages.filter((m) => m.role === "user"))
    .slice(0, 4);

  return (
    <div className="p-6 space-y-8">
      {/* Protocol Status */}
      <div className="space-y-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 border-b border-white/5 pb-3">
          Active Protocols
        </p>
        {[
          {
            label: "Semantic Triangulation",
            status: "Operational",
            progress: 100,
          },
          {
            label: "Source Provenance",
            status: "Verifying",
            progress: 65,
            active: true,
          },
          {
            label: "Contextual Synthesis",
            status: "Syncing",
            progress: 40,
            active: true,
          },
        ].map((p, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white/70">
                {p.label}
              </span>
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  p.active ? "text-[#CC785C]" : "text-white/30",
                )}
              >
                {p.status}
              </span>
            </div>
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000 rounded-full",
                  p.active ? "bg-[#CC785C] animate-pulse" : "bg-white/20",
                )}
                style={{ width: `${p.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Metrics 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="p-4 rounded-[var(--rounded-lg)] bg-white/5 border border-white/5 hover:border-[#CC785C]/20 transition-all group"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center border mb-3 transition-transform group-hover:scale-110",
                m.bg,
              )}
            >
              <m.icon className={cn("h-3.5 w-3.5", m.color)} />
            </div>
            <div className="text-2xl font-serif text-white mb-0.5">
              {m.value}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/35">
              {m.label}
            </div>
            <div className="text-[9px] italic text-white/20 mt-0.5">
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Topics */}
      {recentTopics.length > 0 && (
        <div className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 border-b border-white/5 pb-3">
            Recent Inquiries
          </p>
          <div className="space-y-2">
            {recentTopics.map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-[var(--rounded-md)] bg-white/3 hover:bg-white/5 transition-all group cursor-default"
              >
                <FileText className="h-3.5 w-3.5 text-[#CC785C]/40 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-serif italic text-white/45 leading-relaxed truncate group-hover:text-white/60 transition-colors">
                  {msg.content.substring(0, 60)}
                  {msg.content.length > 60 ? "…" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Note */}
      <div className="relative p-8 rounded-[var(--rounded-xl)] bg-[#CC785C] text-white overflow-hidden group ">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
        <Activity className="h-4 w-4 mb-4 text-white/60" />
        <p className="text-[13px] font-serif italic leading-relaxed relative z-10">
          "Your research trajectory shows strong cross-disciplinary signal. I'm
          monitoring source provenance for potential bias."
        </p>
        <button className="mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] relative z-10 hover:translate-x-1 transition-transform">
          Refine Strategy <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Footer */}
      <div className="py-4 flex justify-center">
        <div className="flex items-center gap-2.5 opacity-15">
          <Layers className="h-3 w-3" />
          <span className="text-[8px] font-bold uppercase tracking-[0.4em]">
            OTIO Engine v4.2
          </span>
        </div>
      </div>
    </div>
  );
}

export function ResearchDashboard() {
  const { dashboardView, setDashboardView, bookmarks } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[var(--surface-dark)] text-white/90">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="spike-mark bg-white scale-75 opacity-50" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
            Intelligence Overview
          </span>
        </div>
        <h2 className="text-2xl font-serif text-white leading-tight">
          {dashboardView === "archives" ? (
            <>
              Knowledge <span className="italic text-[#CC785C]">Archives.</span>
            </>
          ) : (
            <>
              Live Research <span className="italic text-[#CC785C]">Map.</span>
            </>
          )}
        </h2>

        {/* Tab switcher */}
        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
          {[
            { id: "metrics" as const, label: "Intelligence", icon: BarChart2 },
            {
              id: "archives" as const,
              label: `Archives${bookmarks.length > 0 ? ` (${bookmarks.length})` : ""}`,
              icon: Archive,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDashboardView(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
                dashboardView === tab.id
                  ? "bg-white text-[var(--ink)] shadow-sm"
                  : "text-white/35 hover:text-white/60",
              )}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {dashboardView === "archives" ? <ArchivesView /> : <MetricsView />}
      </div>
    </div>
  );
}
