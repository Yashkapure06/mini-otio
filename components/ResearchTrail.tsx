"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Lightbulb, GitBranch, Target } from "lucide-react";
import { useState } from "react";

export interface TrailNode {
  id: string;
  type: "question" | "finding" | "refinement" | "synthesis";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: number;
  children?: string[];
}

interface ResearchTrailProps {
  nodes: TrailNode[];
  onNodeClick?: (nodeId: string) => void;
  expandedNodeId?: string;
  onToggleExpand?: (nodeId: string) => void;
  className?: string;
}

export function ResearchTrail({
  nodes,
  onNodeClick,
  expandedNodeId,
  onToggleExpand,
  className = "",
}: ResearchTrailProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    expandedNodeId ? new Set([expandedNodeId]) : new Set()
  );

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
    onToggleExpand?.(nodeId);
  };

  const getNodeIcon = (type: TrailNode["type"]) => {
    switch (type) {
      case "question":
        return <Target className="w-5 h-5" />;
      case "finding":
        return <Lightbulb className="w-5 h-5" />;
      case "refinement":
        return <GitBranch className="w-5 h-5" />;
      case "synthesis":
        return <Lightbulb className="w-5 h-5 fill-current" />;
      default:
        return <div className="w-5 h-5" />;
    }
  };

  const getNodeColor = (type: TrailNode["type"]) => {
    switch (type) {
      case "question":
        return "text-cohere-blue bg-cohere-blue-wash border-cohere-blue";
      case "finding":
        return "text-cohere-coral bg-cohere-white border-cohere-coral";
      case "refinement":
        return "text-cohere-green bg-cohere-green-wash border-cohere-green";
      case "synthesis":
        return "text-cohere-navy bg-cohere-white border-cohere-navy";
      default:
        return "text-cohere-ink bg-cohere-white border-cohere-hairline";
    }
  };

  const getTypeLabel = (type: TrailNode["type"]) => {
    switch (type) {
      case "question":
        return "Question";
      case "finding":
        return "Finding";
      case "refinement":
        return "Refinement";
      case "synthesis":
        return "Synthesis";
      default:
        return "Note";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-feature-heading font-body text-cohere-ink mb-4">
        Research Trail
      </h3>

      <div className="relative">
        {/* Vertical line connector */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-cohere-hairline via-cohere-coral to-transparent" />

        {/* Trail nodes */}
        <div className="space-y-3">
          {nodes.map((node, idx) => {
            const isExpanded = expandedNodes.has(node.id);
            const hasChildren = node.children && node.children.length > 0;
            const colorClass = getNodeColor(node.type);

            return (
              <div key={node.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-0 top-4 w-12 h-12 flex items-center justify-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      border-2 bg-cohere-white
                      ${colorClass}
                      relative z-10
                    `}
                  >
                    {getNodeIcon(node.type)}
                  </div>
                </div>

                {/* Node content */}
                <Card
                  className={`
                    ml-16 p-4 border-2 cursor-pointer transition-all
                    hover:shadow-md hover:border-cohere-coral
                    ${colorClass}
                  `}
                  onClick={() => onNodeClick?.(node.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cohere-ink text-cohere-white text-xs">
                        {getTypeLabel(node.type)}
                      </Badge>
                      <span className="text-micro text-cohere-slate">
                        {node.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(node.id);
                        }}
                        className="p-1 hover:bg-cohere-hairline rounded transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? "" : "-rotate-90"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  <p className="text-body text-cohere-ink mb-3">{node.content}</p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 items-center text-caption text-cohere-slate">
                    {node.confidence && (
                      <span>Confidence: {node.confidence}%</span>
                    )}
                    {node.sources && (
                      <span>• {node.sources} source(s)</span>
                    )}
                  </div>

                  {/* Child nodes */}
                  {isExpanded && hasChildren && (
                    <div className="mt-4 pt-4 border-t border-cohere-hairline space-y-2">
                      <p className="text-micro font-medium text-cohere-slate">
                        Related findings:
                      </p>
                      <div className="space-y-2">
                        {node.children?.map((childId, childIdx) => (
                          <div
                            key={childIdx}
                            className="pl-3 py-2 border-l-2 border-cohere-coral text-caption text-cohere-slate"
                          >
                            <span className="text-cohere-coral">→</span> Branch {childIdx + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
