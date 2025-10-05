"use client";

import { Chat } from "@/components/Chat";
import { InputBox } from "@/components/InputBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";
import {
  Trash2,
  Sparkles,
  Search,
  Bookmark,
  X,
  Download,
  FileText,
  MessageSquare,
} from "lucide-react";
import { SearchWithinChat } from "@/components/SearchWithinChat";
import { ModernSidebar } from "@/components/ModernSidebar";
import { useEffect } from "react";

export default function Home() {
  const {
    messages,
    clearAllChats,
    isStreaming,
    exportConversation,
    exportHighlights,
    chatSessions,
    currentChatId,
    createNewChat,
    isChatSidebarOpen,
    toggleChatSidebar,
    initializeStore,
    highlights,
    bookmarks,
  } = useAppStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <div className="h-dvh flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {isChatSidebarOpen && <ModernSidebar />}

      <div className="flex-1 flex flex-col min-h-0">
        <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChatSidebar}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex-shrink-0"
              >
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Chats</span>
              </Button>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Mini Otio
                </h1>
              </div>
              <Badge
                variant="secondary"
                className="hidden lg:flex flex-shrink-0"
              >
                <Search className="h-3 w-3 mr-1" />
                Research Assistant
              </Badge>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="hidden sm:block">
                <SearchWithinChat />
              </div>

              <div className="sm:hidden">
                <SearchWithinChat />
              </div>

              {messages.length > 0 && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportConversation}
                          className="text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
                        >
                          <Download className="h-4 w-4 sm:mr-2" />
                          <span className="hidden md:inline">Export Chat</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export conversation as JSON</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}

              {chatSessions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllChats}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clear All Chats</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col relative min-h-0">
          <div className="flex-1 overflow-hidden">
            <Chat />
          </div>
          <div className="flex-shrink-0">
            <InputBox />
          </div>
          {isStreaming && (
            <div className="absolute bottom-20 left-6 right-6 pointer-events-none">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Searching and generating response...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
