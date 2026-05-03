"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Link2, TrendingUp } from "lucide-react";

export interface ResearchSource {
  id: string;
  title: string;
  type: "paper" | "article" | "report" | "webpage" | "book";
  confidence: number;
  citations: number;
  relatedTo: string[];
  extractedAt: Date;
  url?: string;
}

interface SourceNetworkProps {
  sources: ResearchSource[];
  onSourceClick?: (sourceId: string) => void;
  maxConnections?: number;
  className?: string;
}

export function SourceNetwork({
  sources,
  onSourceClick,
  maxConnections = 3,
  className = "",
}: SourceNetworkProps) {
  const getSourceIcon = (type: ResearchSource["type"]) => {
    const baseClass = "w-5 h-5";
    switch (type) {
      case "paper":
        return <Database className={baseClass} />;
      case "article":
        return <Database className={baseClass} />;
      case "report":
        return <TrendingUp className={baseClass} />;
      case "webpage":
        return <Link2 className={baseClass} />;
      case "book":
        return <Database className={baseClass} />;
      default:
        return <Database className={baseClass} />;
    }
  };

  const getSourceColor = (type: ResearchSource["type"]) => {
    switch (type) {
      case "paper":
        return "border-cohere-blue bg-cohere-blue-wash text-cohere-blue";
      case "article":
        return "border-cohere-coral bg-cohere-white text-cohere-coral";
      case "report":
        return "border-cohere-green bg-cohere-green-wash text-cohere-green";
      case "webpage":
        return "border-cohere-slate bg-cohere-white text-cohere-slate";
      case "book":
        return "border-cohere-navy bg-cohere-white text-cohere-navy";
      default:
        return "border-cohere-hairline bg-cohere-white text-cohere-ink";
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8)
      return (
        <Badge className="bg-cohere-green text-cohere-white text-xs">
          HIGH
        </Badge>
      );
    if (confidence >= 0.5)
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

  const sortedSources = [...sources].sort(
    (a, b) => b.citations - a.citations
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-feature-heading font-body text-cohere-ink">
          Source Network
        </h3>
        <span className="text-micro text-cohere-slate">
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Network Grid */}
      <div className="space-y-3">
        {sortedSources.map((source, idx) => {
          const relatedCount = source.relatedTo.length;
          const displayConnections = Math.min(relatedCount, maxConnections);
          const colorClass = getSourceColor(source.type);

          return (
            <div key={source.id} className="group">
              {/* Source Card */}
              <Card
                className={`
                  p-4 border-2 cursor-pointer transition-all
                  hover:shadow-md hover:border-cohere-coral
                  ${colorClass}
                `}
                onClick={() => onSourceClick?.(source.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${colorClass.split(" ")[2]}`}>
                      {getSourceIcon(source.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-body font-medium text-cohere-ink line-clamp-2">
                        {source.title}
                      </h4>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-micro text-cohere-blue hover:underline mt-1"
                        >
                          {new URL(source.url).hostname}
                        </a>
                      )}
                    </div>
                  </div>
                  {getConfidenceBadge(source.confidence)}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-caption text-cohere-slate">
                  <span>Citations: {source.citations}</span>
                  {relatedCount > 0 && (
                    <span>Connected: {relatedCount}</span>
                  )}
                </div>

                {/* Connection Visualization */}
                {relatedCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-cohere-hairline">
                    <p className="text-micro font-medium text-cohere-slate mb-2">
                      Related sources:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {source.relatedTo.slice(0, displayConnections).map(
                        (relatedId, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-micro bg-cohere-white border border-cohere-hairline text-cohere-ink"
                          >
                            <Link2 className="w-3 h-3" />
                            #{i + 1}
                          </div>
                        )
                      )}
                      {relatedCount > displayConnections && (
                        <div className="inline-flex items-center px-2 py-1 rounded text-micro text-cohere-slate">
                          +{relatedCount - displayConnections} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-cohere-hairline rounded-lg">
          <Database className="w-8 h-8 text-cohere-slate mx-auto mb-2 opacity-50" />
          <p className="text-body text-cohere-slate">No sources extracted yet</p>
        </div>
      )}
    </div>
  );
}
