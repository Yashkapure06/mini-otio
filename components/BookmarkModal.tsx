"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, X, Plus } from "lucide-react";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  messageId: string;
}

export function BookmarkModal({
  isOpen,
  onClose,
  content,
  messageId,
}: BookmarkModalProps) {
  const { addBookmark } = useAppStore();
  const [title, setTitle] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const handleSaveBookmark = () => {
    if (title.trim() && keyPoints.length > 0) {
      addBookmark({
        title: title.trim(),
        content,
        keyPoints,
        messageId,
      });
      onClose();
      setTitle("");
      setKeyPoints([]);
      setNewKeyPoint("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddKeyPoint();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-blue-500" />
            <span>Bookmark Response</span>
          </DialogTitle>
          <DialogDescription>
            Save this response with a title and key points for easy reference.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Key Points *</Label>
            <div className="space-y-2">
              {keyPoints.map((point, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm flex-1">{point}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKeyPoint(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a key point..."
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddKeyPoint}
                  disabled={!newKeyPoint.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Preview</Label>
            <Card className="max-h-40 overflow-y-auto">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-6">
                  {content}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveBookmark}
            disabled={!title.trim() || keyPoints.length === 0}
          >
            Save Bookmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
