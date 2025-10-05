"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit3, FileText, RefreshCw, Info, Copy, Check } from "lucide-react";
import { useState } from "react";

interface MessageActionsProps {
  messageId: string;
  content: string;
  onEdit?: () => void;
  onCopy: () => void;
  onCreateNote?: () => void;
  isAssistant?: boolean;
}

export function MessageActions({
  messageId,
  content,
  onEdit,
  onCopy,
  onCreateNote,
  isAssistant = false,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
      <div className="flex items-center space-x-1">
        <Separator orientation="vertical" className="h-3" />

        {onEdit && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit message
            </Button>
            <Separator orientation="vertical" className="h-3" />
          </>
        )}

        {onCreateNote && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateNote}
              className="h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-3 w-3 mr-1" />
              Create a note
            </Button>
            <Separator orientation="vertical" className="h-3" />
          </>
        )}

        {isAssistant && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              GPT-3.5 Turbo
            </Button>
            <Separator orientation="vertical" className="h-3" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {/* Hardcoded values */}
                  <div className="space-y-1 text-xs">
                    <div>Throughput: 92.85 tok/sec</div>
                    <div>Completion: 1260 tokens</div>
                    <div>AI Response Time: 13.57 sec</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="w-px h-3 bg-slate-200 dark:bg-slate-600"></div>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
