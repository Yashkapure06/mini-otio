"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Bookmark, X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface BookmarkViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: {
    id: string;
    title: string;
    content: string;
    keyPoints: string[];
    messageId: string;
    timestamp: Date;
  } | null;
}

export function BookmarkViewModal({
  isOpen,
  onClose,
  bookmark,
}: BookmarkViewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!bookmark) return;
    try {
      await navigator.clipboard.writeText(bookmark.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-blue-500" />
            <span>{bookmark.title}</span>
          </DialogTitle>
          <DialogDescription>
            Bookmarked on {bookmark.timestamp.toLocaleDateString()} at{" "}
            {bookmark.timestamp.toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Key Points ({bookmark.keyPoints.length})
            </h3>
            <div className="grid gap-2">
              {bookmark.keyPoints.map((point, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-sm flex-1">{point}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Full Content
            </h3>
            <Card>
              <CardContent className="p-6">
                <MarkdownRenderer content={bookmark.content} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
