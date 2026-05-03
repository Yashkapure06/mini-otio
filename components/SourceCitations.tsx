"use client";

import { SourceCitation } from "@/lib/store";
import { ExternalLink, Globe, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="space-y-10 animate-editorial">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[rgba(204,120,92,0.1)] flex items-center justify-center border border-[rgba(204,120,92,0.2)]">
            <ShieldCheck className="h-4 w-4 text-[#CC785C]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--ink)]">Authenticated Knowledge Base</span>
            <span className="text-[9px] font-bold text-[var(--muted-soft)] uppercase tracking-[0.2em] mt-0.5">Verified Scholarly Sources</span>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)]">
          <span className="text-[9px] font-bold text-[var(--muted-soft)] uppercase tracking-widest">{sources.length} Nodes Identified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source, index) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col p-8 rounded-2xl card-pro border-[var(--hairline)] hover:border-[#CC785C]/40 transition-all duration-500"
          >
            {/* Index Badge */}
            <div className="absolute top-6 right-8 text-[10px] font-bold text-[var(--muted-soft)] font-serif italic">
              Ref. {index + 1}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[var(--rounded-sm)] bg-[var(--surface-soft)] flex items-center justify-center shrink-0 border border-[var(--hairline)] group-hover:bg-[rgba(204,120,92,0.05)] group-hover:border-[rgba(204,120,92,0.2)] transition-all">
                  <Globe className="h-4 w-4 text-[var(--muted)] group-hover:text-[#CC785C]" />
                </div>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.15em]">
                  {Math.round(source.relevanceScore * 100)}% Context Match
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-[15px] font-serif font-medium text-[var(--ink)] line-clamp-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                  {source.title}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest truncate">
                    {getDomain(source.url)}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-[var(--hairline)]" />
                  <span className="text-[10px] font-bold text-[var(--muted-soft)] uppercase tracking-widest">
                    {source.author || "Global Repository"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--hairline)] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">View Full Context</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--primary)]" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


