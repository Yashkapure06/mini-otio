"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Copy, Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { useState } from "react";
import { BookmarkViewModal } from "@/components/BookmarkViewModal";

export function HighlightsSidebar() {
  const { highlights, bookmarks, removeHighlight, removeBookmark } =
    useAppStore();
  const [copiedHighlightId, setCopiedHighlightId] = useState<string | null>(
    null
  );
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  const handleCopy = async (text: string, highlightId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHighlightId(highlightId);
      setTimeout(() => setCopiedHighlightId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleViewBookmark = (bookmark: any) => {
    setSelectedBookmark(bookmark);
    setShowBookmarkModal(true);
  };

  if (highlights.length === 0 && bookmarks.length === 0) {
    return (
      <div className="w-80 border-l bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bookmark className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-lg">Highlights & Bookmarks</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-muted-foreground text-sm mb-2">
            No highlights or bookmarks yet
          </p>
          <p className="text-xs text-muted-foreground">
            Select text in responses to save highlights or bookmark entire
            responses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Bookmark className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-lg">Highlights & Bookmarks</h3>
        <div className="flex space-x-1">
          {highlights.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {highlights.length} highlights
            </Badge>
          )}
          {bookmarks.length > 0 && (
            <Badge variant="default" className="text-xs">
              {bookmarks.length} bookmarks
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
         {bookmarks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
              <BookmarkCheck className="h-4 w-4" />
              <span>Bookmarks</span>
            </h4>
            {bookmarks.map((bookmark) => (
              <Card
                key={bookmark.id}
                className="p-4 hover:shadow-md transition-shadow bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 group cursor-pointer"
                onClick={() => handleViewBookmark(bookmark)}
              >
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {bookmark.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {bookmark.keyPoints.length} key points
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bookmark.keyPoints.slice(0, 2).map((point, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {point.length > 20
                            ? `${point.substring(0, 20)}...`
                            : point}
                        </Badge>
                      ))}
                      {bookmark.keyPoints.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{bookmark.keyPoints.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {bookmark.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBookmark(bookmark);
                          }}
                          className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBookmark(bookmark.id);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Highlights</span>
            </h4>
            {highlights.map((highlight) => (
              <Card
                key={highlight.id}
                className="p-4 hover:shadow-md transition-shadow bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 group"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm flex-1 leading-relaxed text-slate-700 dark:text-slate-300">
                    {highlight.text}
                  </p>
                  <div className="flex space-x-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(highlight.text, highlight.id)}
                      className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {copiedHighlightId === highlight.id ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHighlight(highlight.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {highlight.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BookmarkViewModal
        isOpen={showBookmarkModal}
        onClose={() => {
          setShowBookmarkModal(false);
          setSelectedBookmark(null);
        }}
        bookmark={selectedBookmark}
      />
    </div>
  );
}
