"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  MoreVertical,
  Calendar,
  Bookmark,
  Search,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
  FileText,
  Download,
  History,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function ModernSidebar() {
  const {
    chatSessions,
    currentChatId,
    createNewChat,
    switchToChat,
    deleteChat,
    updateChatTitle,
    isChatSidebarOpen,
    toggleChatSidebar,
    bookmarks,
    exportConversation,
    removeBookmark,
  } = useAppStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"chats" | "bookmarks">(
    "chats"
  );

  const handleCreateNewChat = () => {
    createNewChat();
  };

  const handleSwitchChat = (chatId: string) => {
    switchToChat(chatId);
  };

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingChatId && editingTitle.trim()) {
      updateChatTitle(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    setShowDeleteDialog(null);
  };

  const handleBookmarkClick = (bookmark: any) => {
    const chatWithBookmark = chatSessions.find((chat) =>
      chat.bookmarks.some((b) => b.id === bookmark.id)
    );

    if (chatWithBookmark) {
      switchToChat(chatWithBookmark.id);
      setActiveSection("chats");
    }
  };

  const handleRemoveBookmark = (bookmarkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(bookmarkId);
  };

  const formatChatTitle = (chat: any) => {
    if (chat.title === "New Chat" && chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find(
        (msg: any) => msg.role === "user"
      );
      if (firstUserMessage) {
        return (
          firstUserMessage.content.substring(0, 50) +
          (firstUserMessage.content.length > 50 ? "..." : "")
        );
      }
    }
    return chat.title;
  };

  if (!isChatSidebarOpen) return null;

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Mini Otio
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Research Assistant
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleChatSidebar}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleCreateNewChat}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveSection("chats")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeSection === "chats"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chats</span>
            {chatSessions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {chatSessions.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveSection("bookmarks")}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeSection === "bookmarks"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Bookmarks</span>
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {bookmarks.length}
              </Badge>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSection === "chats" && (
          <div className="p-6 space-y-3">
            {chatSessions.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No chats yet</p>
                <p className="text-sm">Start a new conversation!</p>
              </div>
            ) : (
              chatSessions.map((chat) => (
                <Card
                  key={chat.id}
                  className={`group p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentChatId === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => handleSwitchChat(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {formatChatTitle(chat)}
                          </h3>
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(chat.updatedAt, {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {chat.messages.length} messages
                          </div>
                        </div>
                      )}
                    </div>

                    {editingChatId !== chat.id && (
                      <div className="flex items-center ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(chat.id, chat.title);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteDialog(chat.id);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <Dialog
          open={showDeleteDialog !== null}
          onOpenChange={(open) =>
            setShowDeleteDialog(open ? showDeleteDialog : null)
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Chat</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete this chat? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showDeleteDialog) {
                    handleDeleteChat(showDeleteDialog);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {activeSection === "bookmarks" && (
          <div className="p-6">
            {bookmarks.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No bookmarks yet</p>
                <p className="text-sm">
                  Bookmark important messages for quick access
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <Card
                    key={bookmark.id}
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    onClick={() => handleBookmarkClick(bookmark)}
                  >
                    <div className="flex items-start space-x-3">
                      <Bookmark className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                              {bookmark.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                              {bookmark.content}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatDistanceToNow(bookmark.timestamp, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) =>
                              handleRemoveBookmark(bookmark.id, e)
                            }
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* <div className="p-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              User
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Research Assistant
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div> */}
    </div>
  );
}
