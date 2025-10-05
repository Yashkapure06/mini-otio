"use client";

import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TypingIndicator } from "@/components/TypingIndicator";
import { RelatedQuestions } from "@/components/RelatedQuestions";
import { MessageActions } from "@/components/MessageActions";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { BookmarkModal } from "@/components/BookmarkModal";
import { SourceCitations } from "@/components/SourceCitations";
import { SearchWithinChat } from "@/components/SearchWithinChat";
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
import { useState } from "react";

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
          if (assistantMessageId) {
            const currentMessage = useAppStore
              .getState()
              .messages.find((m) => m.id === assistantMessageId);
            if (currentMessage) {
              console.log(
                "Updating message with token, current content length:",
                currentMessage.content.length
              );
              updateMessage(assistantMessageId, currentMessage.content + token);
            }
          }
        },
        () => {
          // mark streaming as complete and add sources
          setStreaming(false);
          if (assistantMessageId) {
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
      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const messageElement =
        range.commonAncestorContainer.parentElement?.closest(
          "[data-message-id]"
        );

      if (messageElement) {
        const messageId = messageElement.getAttribute("data-message-id");
        if (messageId) {
          handleHighlight(selectedText, messageId);
        }
      }
    }
  };

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
                    onMouseUp={handleTextSelection}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownRenderer content={message.content} />
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
    </div>
  );
}
