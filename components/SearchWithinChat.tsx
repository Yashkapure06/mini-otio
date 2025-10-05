"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, MessageSquare, Clock, User, Bot } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export function SearchWithinChat() {
  const { messages, searchQuery, setSearchQuery, isSearchOpen, setSearchOpen } =
    useAppStore();
  const [localQuery, setLocalQuery] = useState("");

  const filteredMessages = useMemo(() => {
    if (!localQuery.trim()) return [];

    const query = localQuery.toLowerCase();
    return messages.filter((message) =>
      message.content.toLowerCase().includes(query)
    );
  }, [messages, localQuery]);

  const handleSearch = (query: string) => {
    setLocalQuery(query);
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.querySelector(`[data-message-id="${messageId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-blue-500", "ring-opacity-50");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500", "ring-opacity-50");
      }, 2000);
    }
    setSearchOpen(false);
  };

  return (
    <Sheet open={isSearchOpen} onOpenChange={setSearchOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search Chat</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search within Chat</span>
          </SheetTitle>
          <SheetDescription>
            Search through your conversation history to find specific
            information.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Command>
            <CommandInput
              placeholder="Search messages..."
              value={localQuery}
              onValueChange={handleSearch}
            />
            <CommandList>
              {filteredMessages.length === 0 && localQuery.trim() && (
                <CommandEmpty>No messages found.</CommandEmpty>
              )}

              {filteredMessages.length > 0 && (
                <CommandGroup>
                  {filteredMessages.map((message) => (
                    <CommandItem
                      key={message.id}
                      onSelect={() => scrollToMessage(message.id)}
                      className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          {message.role === "user" ? (
                            <User className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Bot className="h-4 w-4 text-purple-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant={
                                message.role === "user"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {message.role === "user" ? "You" : "Assistant"}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                            {message.role === "assistant" ? (
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: message.content
                                      .toLowerCase()
                                      .split(localQuery.toLowerCase())
                                      .join(
                                        `<mark class="bg-yellow-200 dark:bg-yellow-800">${localQuery}</mark>`
                                      ),
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: message.content
                                    .toLowerCase()
                                    .split(localQuery.toLowerCase())
                                    .join(
                                      `<mark class="bg-yellow-200 dark:bg-yellow-800">${localQuery}</mark>`
                                    ),
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      </SheetContent>
    </Sheet>
  );
}
