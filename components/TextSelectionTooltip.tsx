"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Bookmark, Highlighter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextSelectionTooltipProps {
  selectedText: string;
  messageId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onHighlight: (text: string, messageId: string) => void;
  onBookmark: (text: string, messageId: string) => void;
  onCopy: (text: string) => void;
  isHighlighted?: boolean;
}

export function TextSelectionTooltip({
  selectedText,
  messageId,
  position,
  onClose,
  onHighlight,
  onBookmark,
  onCopy,
  isHighlighted = false,
}: TextSelectionTooltipProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Remove auto-hide timer - tooltip should stay visible as long as text is selected
  // useEffect(() => {
  //   // Auto-hide after 5 seconds if no interaction
  //   const timer = setTimeout(() => {
  //     setIsVisible(false);
  //     setTimeout(onClose, 300);
  //   }, 5000);

  //   return () => clearTimeout(timer);
  // }, [onClose]);

  const handleHighlight = () => {
    console.log("Tooltip: Highlighting text:", selectedText);
    setIsHighlighting(true);
    onHighlight(selectedText, messageId);

    // Show success feedback briefly
    setTimeout(() => {
      setIsHighlighting(false);
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 500);
  };

  const handleBookmark = () => {
    onBookmark(selectedText, messageId);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleCopy = () => {
    onCopy(selectedText);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Adjust position to keep tooltip in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 300),
    y: Math.max(position.y - 60, 10),
  };

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <div
        ref={tooltipRef}
        className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        data-text-selection-tooltip
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg p-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy text</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHighlight}
                  disabled={isHighlighting}
                  className={cn(
                    "h-8 px-2",
                    isHighlighting
                      ? "text-green-600 dark:text-green-400"
                      : isHighlighted
                      ? "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  {isHighlighting ? (
                    <span className="text-xs">✓</span>
                  ) : (
                    <Highlighter className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isHighlighting
                    ? "Highlighted!"
                    : isHighlighted
                    ? "Remove highlight"
                    : "Highlight text"}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save as bookmark</p>
              </TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="h-8 px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Selected text preview */}
          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 max-w-xs">
            <div className="truncate">
              "
              {selectedText.length > 50
                ? selectedText.substring(0, 50) + "..."
                : selectedText}
              "
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
