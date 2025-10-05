"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export function ChatSidebar() {
  const {
    chatSessions,
    currentChatId,
    createNewChat,
    switchToChat,
    deleteChat,
    updateChatTitle,
    isChatSidebarOpen,
    toggleChatSidebar,
  } = useAppStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

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
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Chat History
          </h2>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatSessions.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          chatSessions.map((chat) => (
            <Card
              key={chat.id}
              className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
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
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(chat.id, chat.title);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Dialog
                      open={showDeleteDialog === chat.id}
                      onOpenChange={(open) =>
                        setShowDeleteDialog(open ? chat.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Chat</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>
                            Are you sure you want to delete this chat? This
                            action cannot be undone.
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
                            onClick={() => handleDeleteChat(chat.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


