"use client";

import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TypingIndicator } from "@/components/TypingIndicator";
import { RelatedQuestions } from "@/components/RelatedQuestions";
import { MessageActions } from "@/components/MessageActions";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { StreamingText, StreamingTextRef } from "@/components/StreamingText";
import {
  StreamingTextOptimized,
  StreamingTextOptimizedRef,
} from "@/components/StreamingTextOptimized";
import {
  StreamingTextRenderer,
  StreamingTextRendererRef,
} from "@/components/StreamingTextRenderer";
import { BookmarkModal } from "@/components/BookmarkModal";
import { SourceCitations } from "@/components/SourceCitations";
import { SearchWithinChat } from "@/components/SearchWithinChat";
import { TextSelectionTooltip } from "@/components/TextSelectionTooltip";
import {
  applyHighlightsToElement,
  addHighlightClickListener,
} from "@/lib/highlightUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Search,
  Info,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Chat() {
  const {
    messages,
    highlights,
    bookmarks,
    addHighlight,
    removeHighlight,
    addBookmark,
    isStreaming,
    addRelatedQuestions,
    exportConversation,
    exportHighlights,
  } = useAppStore();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedMessageForBookmark, setSelectedMessageForBookmark] =
    useState<any>(null);
  const streamingRefs = useRef<Map<string, StreamingTextOptimizedRef>>(
    new Map()
  );

  // Text selection tooltip state
  const [showTextTooltip, setShowTextTooltip] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleHighlight = (text: string, messageId: string) => {
    if (!text.trim()) return;

    // Check if this text is already highlighted
    const existingHighlight = highlights.find(
      (h) => h.messageId === messageId && h.text === text
    );

    if (existingHighlight) {
      removeHighlight(existingHighlight.id);
    } else {
      addHighlight({
        text,
        messageId,
      });
    }
  };

  const isBookmarked = (messageId: string) => {
    return bookmarks.some((b) => b.messageId === messageId);
  };

  const handleBookmark = (message: any) => {
    setSelectedMessageForBookmark(message);
    setShowBookmarkModal(true);
  };

  // Text selection tooltip handlers
  const handleTooltipHighlight = (text: string, messageId: string) => {
    console.log("Highlighting text:", text, "for message:", messageId);
    handleHighlight(text, messageId);
    setShowTextTooltip(false);
  };

  const handleTooltipBookmark = (text: string, messageId: string) => {
    // Create a temporary bookmark-like object for the selected text
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      const bookmarkData = {
        ...message,
        content: text, // Use selected text as content
        selectedText: text,
      };
      setSelectedMessageForBookmark(bookmarkData);
      setShowBookmarkModal(true);
    }
    setShowTextTooltip(false);
  };

  const handleTooltipCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(selectedMessageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    setShowTextTooltip(false);
  };

  const isTextHighlighted = (text: string, messageId: string) => {
    return highlights.some((h) => h.messageId === messageId && h.text === text);
  };

  const handleRelatedQuestionClick = async (question: string) => {
    // Add the question as a new user message
    useAppStore.getState().addMessage({
      role: "user",
      content: question,
    });

    // Trigger the full search and AI response flow
    try {
      const { searchWithExa, streamWithAISDK, formatSourceCitations } =
        await import("@/lib/api");
      const {
        addMessage,
        updateMessage,
        updateMessageStreaming,
        updateMessageSources,
        setStreaming,
        addRelatedQuestions,
      } = useAppStore.getState();

      addMessage({
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      const currentMessages = useAppStore.getState().messages;
      const assistantMessage = currentMessages.find(
        (m) => m.role === "assistant" && m.isStreaming
      );
      const assistantMessageId = assistantMessage?.id || "";

      // searching with Exa.ai
      const searchResults = await searchWithExa(question);
      const sources = formatSourceCitations(searchResults.results);

      const conversationHistory = currentMessages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log(
        "Starting streaming with assistantMessageId:",
        assistantMessageId
      );
      await streamWithAISDK(
        conversationHistory,
        searchResults.results,
        "default",
        (token) => {
          // Append token to streaming component instead of updating message content
          if (assistantMessageId) {
            const streamingRef = streamingRefs.current.get(assistantMessageId);
            if (streamingRef) {
              streamingRef.appendToken(token);
            }
          }
        },
        () => {
          // mark streaming as complete and add sources
          setStreaming(false);
          if (assistantMessageId) {
            // Get final content from streaming component
            const streamingRef = streamingRefs.current.get(assistantMessageId);
            let finalContent = "";
            if (streamingRef) {
              finalContent = streamingRef.getContent();
            }

            if (finalContent) {
              updateMessage(assistantMessageId, finalContent);
            }

            updateMessageStreaming(assistantMessageId, false);
            updateMessageSources(
              assistantMessageId,
              sources,
              searchResults.results
            );

            // generate related questions for the assistant message
            const currentMessage = useAppStore
              .getState()
              .messages.find((m) => m.id === assistantMessageId);
            if (currentMessage) {
              const questions = [
                "What are the key benefits of this approach?",
                "Are there any potential drawbacks or limitations?",
                "How does this compare to alternative methods?",
                "What are the practical applications?",
                "Can you provide more specific examples?",
              ];
              addRelatedQuestions(assistantMessageId, questions);
            }
          }
        },
        (error) => {
          console.error("Streaming error:", error);
          setStreaming(false);
          if (assistantMessageId) {
            updateMessage(assistantMessageId, `Error: ${error}`);
            updateMessageStreaming(assistantMessageId, false);
          }
        }
      );
    } catch (error) {
      console.error("Related question error:", error);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const messageElement =
        range.commonAncestorContainer.parentElement?.closest(
          "[data-message-id]"
        );

      if (messageElement) {
        const messageId = messageElement.getAttribute("data-message-id");
        if (messageId) {
          // Get the position of the selection
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setSelectedMessageId(messageId);
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
          setShowTextTooltip(true);
        }
      }
    } else {
      // Only hide tooltip if there's actually no selection
      const currentSelection = window.getSelection();
      if (!currentSelection || !currentSelection.toString().trim()) {
        setShowTextTooltip(false);
      }
    }
  };

  // debounced text selection handler - only for mouseup
  const debouncedTextSelection = () => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      handleTextSelection();
    }, 100); // Small delay to ensure selection is complete
  };

  // handle text selection only on mouseup (when user finishes selecting)
  const handleMouseUp = (e: React.MouseEvent) => {
    debouncedTextSelection();
  };

  // don't show tooltip during selection change (while dragging)
  const handleSelectionChange = () => {
    // Only hide tooltip if there's no selection
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) {
      setShowTextTooltip(false);
    }
  };

  // more responsive selection detection
  const handleMouseDown = (e: React.MouseEvent) => {
    // clear any existing tooltip when starting a new selection
    setShowTextTooltip(false);
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
  };

  // handle highlight click to remove
  const handleHighlightClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const highlightId = target.getAttribute("data-highlight-id");

    if (highlightId) {
      e.preventDefault();
      e.stopPropagation();
      removeHighlight(highlightId);
    }
  };

  const getStreamingRef = (messageId: string) => {
    return streamingRefs.current.get(messageId);
  };

  if (typeof window !== "undefined") {
    (window as any).__streamingRefs = streamingRefs.current;
  }

  // apply highlights to all message elements
  useEffect(() => {
    const messageElements = document.querySelectorAll("[data-message-id]");
    messageElements.forEach((element) => {
      const messageId = element.getAttribute("data-message-id");
      if (messageId) {
        applyHighlightsToElement(element as HTMLElement, highlights, messageId);
        addHighlightClickListener(element as HTMLElement, removeHighlight);
      }
    });
  }, [highlights, removeHighlight]);

  // reapply highlights when streaming content changes
  useEffect(() => {
    if (isStreaming) {
      // a bit delay to ensure DOM is updated with new streaming content
      const timeoutId = setTimeout(() => {
        const messageElements = document.querySelectorAll("[data-message-id]");
        messageElements.forEach((element) => {
          const messageId = element.getAttribute("data-message-id");
          if (messageId) {
            applyHighlightsToElement(
              element as HTMLElement,
              highlights,
              messageId
            );
          }
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isStreaming, highlights]);

  // close tooltip when clicking outside and handle selection changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTextTooltip) {
        // check if click is on the tooltip itself
        const target = event.target as HTMLElement;
        const isTooltipClick = target.closest("[data-text-selection-tooltip]");

        if (!isTooltipClick) {
          const selection = window.getSelection();
          if (!selection || !selection.toString().trim()) {
            setShowTextTooltip(false);
          }
        }
      }
    };

    const handleDocumentSelectionChange = () => {
      handleSelectionChange();
    };

    // listen for clicks and selection changes (only to hide tooltip)
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("selectionchange", handleDocumentSelectionChange);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener(
        "selectionchange",
        handleDocumentSelectionChange
      );
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [showTextTooltip]);

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Mini Otio
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
              Your AI-powered research assistant. Ask any question and I'll
              search the web to provide you with comprehensive, up-to-date
              answers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/50 dark:bg-slate-800/50 shadow-sm rounded-lg">
                <Search className="h-4 w-4 text-blue-500" />
                <span>Web Search</span>
              </div>
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/50 dark:bg-slate-800/50 shadow-sm rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            data-message-id={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-[95%] sm:max-w-[85%] shadow-sm hover:shadow-md transition-shadow group ${
                message.role === "user"
                  ? "bg-white border-slate-200 dark:border-slate-700"
                  : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 min-w-0"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onClick={handleHighlightClick}
                  >
                    {message.role === "assistant" ? (
                      message.isStreaming ? (
                        <StreamingTextOptimized
                          ref={(ref) => {
                            if (ref) {
                              streamingRefs.current.set(message.id, ref);
                            } else {
                              streamingRefs.current.delete(message.id);
                            }
                          }}
                          content={message.content}
                          isStreaming={message.isStreaming}
                          highlights={highlights}
                          messageId={message.id}
                        />
                      ) : (
                        <MarkdownRenderer
                          content={message.content}
                          highlights={highlights}
                          messageId={message.id}
                        />
                      )
                    ) : (
                      <div className="text-slate-900 dark:text-slate-100 leading-relaxed break-words">
                        {message.content}
                      </div>
                    )}
                    {message.isStreaming && <TypingIndicator />}
                  </div>
                  <div className="flex space-x-1 ml-2 sm:ml-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.content, message.id)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {copiedMessageId === message.id ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(message)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        {isBookmarked(message.id) ? (
                          <BookmarkCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <MessageActions
                  messageId={message.id}
                  content={message.content}
                  onCopy={() => handleCopy(message.content, message.id)}
                  isAssistant={message.role === "assistant"}
                />

                {/* Links to the sources */}
                {message.role === "assistant" &&
                  !message.isStreaming &&
                  message.sources && (
                    <SourceCitations
                      sources={message.sources}
                      searchResults={message.searchResults}
                    />
                  )}

                {/* Related Questions for Assistant Messages */}
                {message.role === "assistant" && !message.isStreaming && (
                  <RelatedQuestions
                    messageId={message.id}
                    onQuestionClick={handleRelatedQuestionClick}
                  />
                )}
              </div>
            </Card>
          </div>
        ))
      )}

      {selectedMessageForBookmark && (
        <BookmarkModal
          isOpen={showBookmarkModal}
          onClose={() => {
            setShowBookmarkModal(false);
            setSelectedMessageForBookmark(null);
          }}
          content={selectedMessageForBookmark.content}
          messageId={selectedMessageForBookmark.id}
        />
      )}

      {/* Text Selection Tooltip */}
      {showTextTooltip && (
        <TextSelectionTooltip
          selectedText={selectedText}
          messageId={selectedMessageId}
          position={tooltipPosition}
          onClose={() => setShowTextTooltip(false)}
          onHighlight={handleTooltipHighlight}
          onBookmark={handleTooltipBookmark}
          onCopy={handleTooltipCopy}
          isHighlighted={isTextHighlighted(selectedText, selectedMessageId)}
        />
      )}
    </div>
  );
}
