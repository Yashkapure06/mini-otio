"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, Grid3X3, Sparkles, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";
import { messageInputSchema, ResponseStyle } from "@/lib/validators";
import {
  searchWithExa,
  streamWithAISDK,
  formatSearchContext,
  formatSourceCitations,
  generateRelatedQuestions,
} from "@/lib/api";

const responseStyles: { value: ResponseStyle; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "step-by-step", label: "Step-by-step" },
  { value: "bullet summary", label: "Bullet Summary" },
  { value: "explain like I'm 5", label: "Explain Like I'm 5" },
];

export function InputBox() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedStyle,
    setSelectedStyle,
    addMessage,
    updateMessage,
    updateMessageStreaming,
    updateMessageSources,
    setStreaming,
    addRelatedQuestions,
    messages,
    chatSessions,
    createNewChat,
  } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    try {
      const validatedInput = messageInputSchema.parse({
        query,
        style: selectedStyle,
      });

      if (chatSessions.length === 0) {
        createNewChat();
      }

      setIsSubmitting(true);
      setStreaming(true);

      addMessage({
        role: "user",
        content: query,
      });

      addMessage({
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      // get the assistant message ID
      const currentMessages = useAppStore.getState().messages;
      const assistantMessage = currentMessages.find(
        (m) => m.role === "assistant" && m.isStreaming
      );
      const assistantMessageId = assistantMessage?.id || "";

      // seearch with Exa.ai
      const searchResults = await searchWithExa(query);
      const sources = formatSourceCitations(searchResults.results);

      // prepare conversation history
      const conversationHistory = currentMessages
        .filter((msg) => !msg.isStreaming)
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Stream response using AI SDK
      await streamWithAISDK(
        conversationHistory,
        searchResults.results,
        selectedStyle,
        (token) => {
          // update the assistant message with new token
          if (assistantMessageId) {
            const currentMessage = useAppStore
              .getState()
              .messages.find((m) => m.id === assistantMessageId);
            if (currentMessage) {
              updateMessage(assistantMessageId, currentMessage.content + token);
            }
          }
        },
        async () => {
          console.log("Streaming completed for message:", assistantMessageId);
          setStreaming(false);
          if (assistantMessageId) {
            updateMessageStreaming(assistantMessageId, false);
            updateMessageSources(
              assistantMessageId,
              sources,
              searchResults.results
            );

            const currentMessage = useAppStore
              .getState()
              .messages.find((m) => m.id === assistantMessageId);
            if (currentMessage) {
              // generate dynamic related questions based on content
              try {
                const questions = await generateRelatedQuestions(
                  currentMessage.content,
                  searchResults.results,
                  query
                );
                addRelatedQuestions(assistantMessageId, questions);
              } catch (error) {
                console.error("Failed to generate related questions:", error);
                // Fallback to basic questions if generation fails
                const fallbackQuestions = [
                  "Can you provide more details about this topic?",
                  "What are the key benefits of this approach?",
                  "Are there any potential drawbacks or limitations?",
                  "How does this compare to alternative methods?",
                  "What are the practical applications?",
                ];
                addRelatedQuestions(assistantMessageId, fallbackQuestions);
              }
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

      setQuery("");
    } catch (error) {
      console.error("Submit error:", error);
      setStreaming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-white border-t border-slate-200">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex items-center justify-center">
                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                GPT-3.5 Turbo
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Badge className="bg-slate-800 text-white text-xs px-1 sm:px-2 py-1 rounded-md">
                <Grid3X3 className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden sm:inline">Auto-detect</span>
                <span className="sm:hidden">Auto</span>
              </Badge>
              <Badge
                variant="outline"
                className="text-xs px-1 sm:px-2 py-1 rounded-md border-blue-200 text-blue-700 bg-blue-50"
              >
                <span className="hidden sm:inline">
                  {responseStyles.find((s) => s.value === selectedStyle)?.label}
                </span>
                <span className="sm:hidden">
                  {
                    responseStyles
                      .find((s) => s.value === selectedStyle)
                      ?.label.split(" ")[0]
                  }
                </span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4">
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-lg">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to know?"
              className="min-h-[60px] sm:min-h-[80px] max-h-[150px] sm:max-h-[200px] resize-none pr-16 sm:pr-20 pl-3 sm:pl-4 py-3 sm:py-4 text-sm sm:text-base border-0 focus:ring-0 focus:outline-none bg-transparent placeholder:text-slate-400 placeholder:italic"
              disabled={isSubmitting}
            />

            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center space-x-1 sm:space-x-2">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 sm:h-8 px-2 sm:px-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs sm:text-sm rounded-lg"
                      >
                        <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Response Style</span>
                        <span className="sm:hidden">Style</span>
                        <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select Response Style</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuRadioGroup
                    value={selectedStyle}
                    onValueChange={(v) => setSelectedStyle(v as ResponseStyle)}
                  >
                    {responseStyles.map((style) => (
                      <DropdownMenuRadioItem
                        key={style.value}
                        value={style.value}
                      >
                        {style.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={isSubmitting || !query.trim()}
                  className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 h-6 w-6 sm:h-8 sm:w-8 p-0 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                  size="sm"
                >
                  {isSubmitting ? (
                    <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSubmitting ? "Sending..." : "Send Message"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
