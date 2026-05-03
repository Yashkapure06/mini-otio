"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Heart, Reply } from "lucide-react";
import { useState } from "react";

export interface AnnotationComment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
}

export interface Annotation {
  id: string;
  finding: string;
  context: string;
  author: string;
  avatar?: string;
  timestamp: Date;
  color?: "coral" | "green" | "blue" | "navy";
  comments: AnnotationComment[];
  visibility: "private" | "team" | "public";
}

interface CollaborativeAnnotationsProps {
  annotations: Annotation[];
  currentUser?: string;
  onAddComment?: (annotationId: string, comment: string) => void;
  onShare?: (annotationId: string) => void;
  onDelete?: (annotationId: string) => void;
  className?: string;
}

export function CollaborativeAnnotations({
  annotations,
  currentUser = "You",
  onAddComment,
  onShare,
  onDelete,
  className = "",
}: CollaborativeAnnotationsProps) {
  const [expandedAnnotation, setExpandedAnnotation] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const getColorClasses = (color?: string) => {
    switch (color) {
      case "coral":
        return "border-cohere-coral text-cohere-coral bg-cohere-white";
      case "green":
        return "border-cohere-green text-cohere-green bg-cohere-green-wash";
      case "blue":
        return "border-cohere-blue text-cohere-blue bg-cohere-blue-wash";
      case "navy":
        return "border-cohere-navy text-cohere-navy bg-cohere-white";
      default:
        return "border-cohere-hairline text-cohere-ink bg-cohere-white";
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "private":
        return (
          <Badge className="bg-cohere-slate text-cohere-white text-xs">
            🔒 Private
          </Badge>
        );
      case "team":
        return (
          <Badge className="bg-cohere-blue text-cohere-white text-xs">
            👥 Team
          </Badge>
        );
      case "public":
        return (
          <Badge className="bg-cohere-green text-cohere-white text-xs">
            🌐 Public
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-5 h-5 text-cohere-coral" />
        <h3 className="text-feature-heading font-body text-cohere-ink">
          Collaborative Annotations
        </h3>
        <Badge className="bg-cohere-coral text-cohere-white">
          {annotations.length}
        </Badge>
      </div>

      {/* Annotations List */}
      <div className="space-y-3">
        {annotations.map((annotation) => {
          const isExpanded = expandedAnnotation === annotation.id;
          const colorClasses = getColorClasses(annotation.color);

          return (
            <Card
              key={annotation.id}
              className={`border-2 cursor-pointer transition-all hover:shadow-md overflow-hidden ${colorClasses}`}
            >
              {/* Annotation Header */}
              <button
                onClick={() =>
                  setExpandedAnnotation(isExpanded ? null : annotation.id)
                }
                className="w-full p-4 text-left hover:bg-black hover:bg-opacity-5 transition-colors"
              >
                <div className="space-y-3">
                  {/* Author Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cohere-coral flex items-center justify-center text-cohere-white text-micro font-medium">
                        {annotation.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-caption font-medium text-cohere-ink">
                          {annotation.author}
                        </p>
                        <p className="text-micro text-cohere-slate">
                          {annotation.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getVisibilityBadge(annotation.visibility)}
                  </div>

                  {/* Annotation Content */}
                  <div>
                    <p className="text-body font-medium text-cohere-ink mb-1">
                      {annotation.finding}
                    </p>
                    <p className="text-caption text-cohere-slate">
                      "{annotation.context}"
                    </p>
                  </div>

                  {/* Comment Count */}
                  <div className="flex items-center gap-1 text-caption text-cohere-slate">
                    <MessageSquare className="w-4 h-4" />
                    {annotation.comments.length} comment
                    {annotation.comments.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-current border-opacity-20 p-4 space-y-4 bg-black bg-opacity-2 animate-slide-down">
                  {/* Comments Section */}
                  {annotation.comments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-caption font-medium text-cohere-slate uppercase tracking-wider">
                        Discussion
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {annotation.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-cohere-white rounded p-3 border border-cohere-hairline"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-cohere-blue flex items-center justify-center text-cohere-white text-xs font-medium">
                                  {comment.author.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-micro font-medium text-cohere-ink">
                                    {comment.author}
                                  </p>
                                  <p className="text-micro text-cohere-slate">
                                    {comment.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <button className="text-micro text-cohere-slate hover:text-cohere-coral transition-colors">
                                <Heart
                                  className={`w-4 h-4 ${
                                    likedComments.has(comment.id)
                                      ? "fill-cohere-coral text-cohere-coral"
                                      : ""
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="text-caption text-cohere-ink">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="space-y-2 pt-2 border-t border-current border-opacity-20">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComments[annotation.id] || ""}
                        onChange={(e) =>
                          setNewComments({
                            ...newComments,
                            [annotation.id]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 rounded text-micro border border-cohere-hairline focus:border-cohere-coral focus:outline-none"
                      />
                      <Button
                        onClick={() => {
                          if (newComments[annotation.id]) {
                            onAddComment?.(
                              annotation.id,
                              newComments[annotation.id]
                            );
                            setNewComments({
                              ...newComments,
                              [annotation.id]: "",
                            });
                          }
                        }}
                        className="bg-cohere-coral hover:bg-cohere-coral hover:opacity-90 text-cohere-white text-micro px-3 py-2 rounded"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => onShare?.(annotation.id)}
                      variant="outline"
                      className="flex-1 text-micro border-current text-current hover:bg-black hover:bg-opacity-5"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    {currentUser === annotation.author && (
                      <Button
                        onClick={() => onDelete?.(annotation.id)}
                        variant="outline"
                        className="flex-1 text-micro border-cohere-error text-cohere-error hover:bg-cohere-error hover:bg-opacity-10"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {annotations.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-cohere-hairline rounded-lg">
          <MessageSquare className="w-8 h-8 text-cohere-slate mx-auto mb-2 opacity-50" />
          <p className="text-body text-cohere-slate">
            No annotations yet
          </p>
          <p className="text-caption text-cohere-slate mt-1">
            Start collaborating by annotating key findings
          </p>
        </div>
      )}
    </div>
  );
}
