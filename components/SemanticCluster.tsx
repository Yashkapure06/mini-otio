"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";

export interface ClusterItem {
  id: string;
  title: string;
  summary: string;
  itemCount: number;
  confidence: number;
  relatedTopics: string[];
  color?: "coral" | "green" | "blue" | "navy";
}

interface SemanticClusterProps {
  clusters: ClusterItem[];
  onClusterClick?: (clusterId: string) => void;
  onTopicClick?: (topic: string) => void;
  className?: string;
}

export function SemanticCluster({
  clusters,
  onClusterClick,
  onTopicClick,
  className = "",
}: SemanticClusterProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const getColorClasses = (color?: string) => {
    switch (color) {
      case "coral":
        return {
          badge: "bg-cohere-coral text-cohere-white",
          border: "border-cohere-coral",
          bg: "bg-cohere-white",
        };
      case "green":
        return {
          badge: "bg-cohere-green text-cohere-white",
          border: "border-cohere-green",
          bg: "bg-cohere-green-wash",
        };
      case "blue":
        return {
          badge: "bg-cohere-blue text-cohere-white",
          border: "border-cohere-blue",
          bg: "bg-cohere-blue-wash",
        };
      case "navy":
        return {
          badge: "bg-cohere-navy text-cohere-white",
          border: "border-cohere-navy",
          bg: "bg-cohere-white",
        };
      default:
        return {
          badge: "bg-cohere-slate text-cohere-white",
          border: "border-cohere-hairline",
          bg: "bg-cohere-white",
        };
    }
  };

  const sortedClusters = [...clusters].sort((a, b) => b.itemCount - a.itemCount);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-cohere-coral" />
        <h3 className="text-feature-heading font-body text-cohere-ink">
          Research Clusters
        </h3>
        <Badge className="bg-cohere-coral text-cohere-white">
          {clusters.length}
        </Badge>
      </div>

      {/* Clusters Grid */}
      <div className="space-y-2">
        {sortedClusters.map((cluster) => {
          const colorClasses = getColorClasses(cluster.color);
          const isExpanded = expandedCluster === cluster.id;

          return (
            <div
              key={cluster.id}
              className="group"
            >
              {/* Cluster Header */}
              <button
                onClick={() => {
                  setExpandedCluster(isExpanded ? null : cluster.id);
                  onClusterClick?.(cluster.id);
                }}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left
                  hover:shadow-md hover:border-cohere-coral
                  ${colorClasses.bg} ${colorClasses.border}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-body font-medium text-cohere-ink">
                        {cluster.title}
                      </h4>
                      <Badge className={`text-xs ${colorClasses.badge}`}>
                        {cluster.itemCount}
                      </Badge>
                    </div>
                    <p className="text-caption text-cohere-slate">
                      {cluster.summary}
                    </p>
                  </div>
                  <ChevronRight
                    className={`
                      w-5 h-5 text-cohere-slate transition-transform
                      ${isExpanded ? "rotate-90" : ""}
                      ml-2 flex-shrink-0
                    `}
                  />
                </div>

                {/* Confidence Indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-cohere-hairline rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClasses.badge}`}
                      style={{ width: `${cluster.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-micro text-cohere-slate">
                    {(cluster.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-cohere-coral space-y-2 animate-slide-down">
                  <div>
                    <p className="text-micro text-cohere-slate font-medium mb-2">
                      RELATED TOPICS
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cluster.relatedTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => onTopicClick?.(topic)}
                          className="
                            px-3 py-1 rounded-full text-micro
                            bg-cohere-white border border-cohere-coral
                            text-cohere-coral hover:bg-cohere-coral hover:text-cohere-white
                            transition-all
                          "
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cluster Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="text-center py-2 rounded bg-cohere-white border border-cohere-hairline">
                      <p className="text-caption font-medium text-cohere-ink">
                        Items
                      </p>
                      <p className="text-feature-heading font-display text-cohere-coral">
                        {cluster.itemCount}
                      </p>
                    </div>
                    <div className="text-center py-2 rounded bg-cohere-white border border-cohere-hairline">
                      <p className="text-caption font-medium text-cohere-ink">
                        Confidence
                      </p>
                      <p className="text-feature-heading font-display text-cohere-green">
                        {(cluster.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {clusters.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-cohere-hairline rounded-lg">
          <Zap className="w-8 h-8 text-cohere-slate mx-auto mb-2 opacity-50" />
          <p className="text-body text-cohere-slate">
            No clusters identified yet
          </p>
          <p className="text-caption text-cohere-slate mt-1">
            Run semantic analysis to group related findings
          </p>
        </div>
      )}
    </div>
  );
}
