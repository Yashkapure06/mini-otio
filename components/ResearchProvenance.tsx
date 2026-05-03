"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Link, Quote, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface ProvenanceEntry {
  id: string;
  claim: string;
  source: {
    title: string;
    url?: string;
    author?: string;
    type: "paper" | "article" | "webpage" | "book";
  };
  quotation?: string;
  pageNumber?: number | string;
  confidence: number;
  extractedAt: Date;
}

interface ResearchProvenanceProps {
  entries: ProvenanceEntry[];
  onSourceClick?: (sourceTitle: string) => void;
  onQuotationCopy?: (quotation: string) => void;
  className?: string;
}

export function ResearchProvenance({
  entries,
  onSourceClick,
  onQuotationCopy,
  className = "",
}: ResearchProvenanceProps) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case "paper":
        return <FileText className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "webpage":
        return <Link className="w-4 h-4" />;
      case "book":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case "paper":
        return "text-cohere-blue border-cohere-blue";
      case "article":
        return "text-cohere-coral border-cohere-coral";
      case "webpage":
        return "text-cohere-slate border-cohere-slate";
      case "book":
        return "text-cohere-navy border-cohere-navy";
      default:
        return "text-cohere-ink border-cohere-hairline";
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85)
      return (
        <Badge className="bg-cohere-green text-cohere-white text-xs">
          HIGH
        </Badge>
      );
    if (confidence >= 0.6)
      return (
        <Badge className="bg-cohere-blue text-cohere-white text-xs">
          MEDIUM
        </Badge>
      );
    return (
      <Badge className="bg-cohere-slate text-cohere-white text-xs">
        LOW
      </Badge>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-feature-heading font-body text-cohere-ink">
          Research Provenance
        </h3>
        <span className="text-micro text-cohere-slate">
          {entries.length} claim{entries.length !== 1 ? "s" : ""} tracked
        </span>
      </div>

      {/* Provenance Entries */}
      <div className="space-y-3">
        {entries.map((entry, idx) => {
          const isExpanded = expandedEntry === entry.id;
          const typeColor = getSourceTypeColor(entry.source.type);

          return (
            <div key={entry.id} className="border-b border-cohere-hairline pb-4 last:border-0">
              {/* Entry Header */}
              <button
                onClick={() =>
                  setExpandedEntry(isExpanded ? null : entry.id)
                }
                className="w-full text-left py-2 hover:bg-cohere-stone hover:bg-opacity-30 rounded px-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Index Dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-cohere-coral bg-opacity-10 border-2 border-cohere-coral flex items-center justify-center text-micro font-medium text-cohere-coral">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Claim Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="text-body text-cohere-ink font-medium">
                        {entry.claim}
                      </p>
                      <ChevronDown
                        className={`
                          w-4 h-4 text-cohere-slate transition-transform flex-shrink-0
                          ${isExpanded ? "" : "-rotate-90"}
                        `}
                      />
                    </div>

                    {/* Source Badge */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${typeColor}`}>
                        {getSourceTypeIcon(entry.source.type)}
                        <span className="text-caption">{entry.source.title}</span>
                      </div>
                      {getConfidenceBadge(entry.confidence)}
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 ml-8 pl-4 border-l-2 border-cohere-coral space-y-3 animate-slide-down">
                  {/* Source Details */}
                  <Card className="border-cohere-border bg-cohere-blue-wash p-3">
                    <p className="text-micro font-medium text-cohere-slate mb-2">
                      SOURCE
                    </p>
                    <div className="space-y-1">
                      <p className="text-body font-medium text-cohere-ink">
                        {entry.source.title}
                      </p>
                      {entry.source.author && (
                        <p className="text-caption text-cohere-slate">
                          By {entry.source.author}
                        </p>
                      )}
                      {entry.source.url && (
                        <a
                          href={entry.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onSourceClick?.(entry.source.title)}
                          className="text-caption text-cohere-blue hover:underline block"
                        >
                          {entry.source.url}
                        </a>
                      )}
                      {entry.pageNumber && (
                        <p className="text-caption text-cohere-slate">
                          Page: {entry.pageNumber}
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Quotation */}
                  {entry.quotation && (
                    <Card className="border-cohere-coral bg-cohere-stone bg-opacity-50 p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Quote className="w-4 h-4 text-cohere-coral flex-shrink-0 mt-1" />
                        <p className="text-micro font-medium text-cohere-slate">
                          QUOTATION
                        </p>
                      </div>
                      <blockquote className="text-body text-cohere-ink italic border-l-2 border-cohere-coral pl-3 py-1">
                        "{entry.quotation}"
                      </blockquote>
                      <button
                        onClick={() => onQuotationCopy?.(entry.quotation!)}
                        className="text-micro text-cohere-blue hover:text-cohere-coral transition-colors mt-2"
                      >
                        Copy quotation
                      </button>
                    </Card>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-caption">
                    <div className="text-cohere-slate">
                      <span className="font-medium">Confidence:</span>{" "}
                      {(entry.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-cohere-slate">
                      <span className="font-medium">Extracted:</span>{" "}
                      {entry.extractedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-cohere-hairline rounded-lg">
          <FileText className="w-8 h-8 text-cohere-slate mx-auto mb-2 opacity-50" />
          <p className="text-body text-cohere-slate">
            No claims tracked yet
          </p>
          <p className="text-caption text-cohere-slate mt-1">
            Claims and their sources will appear here as research progresses
          </p>
        </div>
      )}
    </div>
  );
}
