"use client";

import { SourceCitation } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User, Star } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface SourceCitationsProps {
  sources: SourceCitation[];
  searchResults?: any[];
}

export function SourceCitations({
  sources,
  searchResults,
}: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Sources ({sources.length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                Click to {isOpen ? "hide" : "view"}
              </Badge>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3">
          <div className="grid gap-3">
            {sources.map((source, index) => (
              <Card
                key={source.id}
                className="p-4 hover:shadow-md transition-shadow bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 group"
              >
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {source.title}
                      </a>
                    </CardTitle>
                    <div className="flex items-center space-x-1 ml-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {source.author && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{source.author}</span>
                        </div>
                      )}
                      {source.publishedDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(
                              source.publishedDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{source.relevanceScore.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground break-all">
                      {source.url}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}


