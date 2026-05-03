"use client";

import { useAppStore, ChatSession } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  MoreVertical,
  Search,
  Settings,
  Clock,
  Archive,
  LayoutDashboard,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function groupByTime(sessions: ChatSession[]) {
  const now = new Date();
  const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(sod.getTime() - 86400000);
  const d7 = new Date(sod.getTime() - 6 * 86400000);
  const d30 = new Date(sod.getTime() - 29 * 86400000);

  const groups: { label: string; chats: ChatSession[] }[] = [
    { label: "Today", chats: [] },
    { label: "Yesterday", chats: [] },
    { label: "Previous 7 days", chats: [] },
    { label: "Previous 30 days", chats: [] },
    { label: "Older", chats: [] },
  ];

  for (const chat of sessions) {
    const t = new Date(chat.updatedAt);
    if (t >= sod) groups[0].chats.push(chat);
    else if (t >= yesterday) groups[1].chats.push(chat);
    else if (t >= d7) groups[2].chats.push(chat);
    else if (t >= d30) groups[3].chats.push(chat);
    else groups[4].chats.push(chat);
  }

  return groups.filter((g) => g.chats.length > 0);
}

export function ModernSidebar() {
  const {
    chatSessions,
    currentChatId,
    createNewChat,
    switchToChat,
    deleteChat,
    updateChatTitle,
    isDashboardOpen,
    toggleDashboard,
    dashboardView,
    setDashboardView,
  } = useAppStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return chatSessions;
    return chatSessions.filter(
      (s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.messages.some((m) =>
          m.content.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [chatSessions, searchQuery]);

  const groups = useMemo(
    () => groupByTime(filteredSessions),
    [filteredSessions],
  );

  const saveEdit = () => {
    if (editingChatId && editingTitle.trim()) {
      updateChatTitle(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const cancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const getChatTitle = (chat: ChatSession) => {
    if (chat.title === "New Chat" && chat.messages.length > 0) {
      const first = chat.messages.find((m) => m.role === "user");
      if (first) return first.content.substring(0, 60);
    }
    return chat.title;
  };

  const navItems = [
    {
      label: "Research Hub",
      icon: Search,
      active: !isDashboardOpen,
      onClick: () => {
        if (isDashboardOpen) toggleDashboard();
      },
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      active: isDashboardOpen && dashboardView === "metrics",
      onClick: () => {
        setDashboardView("metrics");
        if (!isDashboardOpen) toggleDashboard();
      },
    },
    {
      label: "Archives",
      icon: Archive,
      active: isDashboardOpen && dashboardView === "archives",
      onClick: () => {
        setDashboardView("archives");
        if (!isDashboardOpen) toggleDashboard();
      },
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--surface-soft)] border-r border-[var(--hairline)]">
      {/* Top Actions */}
      <div className="p-5 pb-3 space-y-4">
        <Button
          onClick={() => createNewChat()}
          className="w-full btn-primary h-11 shadow-sm flex items-center justify-center gap-2.5"
        >
          <Plus className="h-4 w-4" />
          New Session
        </Button>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-soft)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-[var(--canvas)] border border-[var(--hairline)] focus:border-[var(--primary)] rounded-[var(--rounded-md)] text-xs font-medium placeholder:text-[var(--muted-soft)] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="px-4 mt-2 space-y-0.5">
        <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--muted)] opacity-40">
          Intelligence Hub
        </p>
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--rounded-md)] text-[12px] font-bold transition-all duration-200 group relative",
              item.active
                ? "bg-white text-[var(--ink)] shadow-sm border border-[var(--hairline)]"
                : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/60",
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                item.active
                  ? "text-[#CC785C]"
                  : "text-[var(--muted-soft)] group-hover:text-[#CC785C]",
              )}
            />
            <span className="truncate">{item.label}</span>
            {item.active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#CC785C]" />
            )}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="mt-6 px-4 flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-3 mb-4 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--muted)] opacity-40">
            Recent Inquiries
          </span>
          <Clock className="h-3 w-3 text-[var(--muted-soft)] opacity-60" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none pb-4">
          {filteredSessions.length === 0 ? (
            <div className="px-3 py-10 text-center border border-dashed border-[var(--hairline)] rounded-[var(--rounded-lg)]">
              <p className="text-[11px] font-medium text-[var(--muted-soft)] leading-relaxed">
                Research ledger empty.
                <br />
                <span className="italic">Begin a new inquiry above.</span>
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="space-y-0.5">
                <h3 className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted-soft)] mb-2 opacity-60">
                  {group.label}
                </h3>
                {group.chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() =>
                      editingChatId !== chat.id && switchToChat(chat.id)
                    }
                    className={cn(
                      "relative group rounded-[var(--rounded-md)] transition-all duration-150 border cursor-pointer",
                      currentChatId === chat.id
                        ? "bg-white border-[var(--hairline)] shadow-sm"
                        : "border-transparent hover:bg-white/50 hover:border-[var(--hairline)]",
                    )}
                  >
                    <div className="flex items-start gap-3 px-3 py-3">
                      <div
                        className={cn(
                          "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all",
                          currentChatId === chat.id
                            ? "bg-[#CC785C]"
                            : "bg-transparent group-hover:bg-[var(--muted-soft)]",
                        )}
                      />
                      <div className="flex-1 min-w-0 pr-6">
                        {editingChatId === chat.id ? (
                          <input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full h-7 bg-[var(--canvas)] border border-[#CC785C] rounded-md px-2 text-xs text-[var(--ink)] focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                        ) : (
                          <>
                            <p
                              className={cn(
                                "text-[12px] font-semibold truncate leading-tight font-serif italic transition-colors",
                                currentChatId === chat.id
                                  ? "text-[var(--ink)]"
                                  : "text-[var(--muted)] group-hover:text-[var(--ink)]",
                              )}
                            >
                              {getChatTitle(chat)}
                            </p>
                            <p className="text-[9px] text-[var(--muted-soft)] mt-1 uppercase tracking-widest">
                              {new Date(chat.createdAt).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 transition-opacity",
                        currentChatId === chat.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-[var(--surface-soft)] rounded-[var(--rounded-sm)] text-[var(--muted-soft)] hover:text-[var(--ink)] transition-all"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={6}
                          className="w-52 p-2 bg-white border border-[var(--hairline)] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] animate-editorial"
                        >
                          <div className="px-3 py-1.5 mb-1.5 border-b border-[var(--hairline)]">
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--muted-soft)]">
                              Session Actions
                            </span>
                          </div>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setEditingTitle(getChatTitle(chat));
                            }}
                            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer rounded-xl px-3 py-3 transition-all"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-[var(--muted-soft)]" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteDialog(chat.id);
                            }}
                            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[var(--error)] hover:bg-[var(--error)]/5 cursor-pointer rounded-xl px-3 py-3 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Discard
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Status */}
      <div className="p-4 border-t border-[var(--hairline)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--rounded-lg)] hover:bg-white hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-[var(--hairline)] group">
          <div className="w-8 h-8 rounded-full bg-[var(--ink)] flex items-center justify-center text-[var(--on-dark)] font-serif italic text-sm shadow-sm flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[var(--ink)] truncate">
              Academic Account
            </p>
            <p className="text-[9px] font-bold text-[#CC785C] uppercase tracking-[0.15em]">
              Pro Scholar
            </p>
          </div>
          <Settings className="h-3.5 w-3.5 text-[var(--muted-soft)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={showDeleteDialog !== null}
        onOpenChange={(o) => !o && setShowDeleteDialog(null)}
      >
        <DialogContent className="bg-[var(--canvas)] border border-[var(--hairline)] max-w-sm rounded-[var(--rounded-xl)] shadow-2xl p-4 animate-editorial">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-[var(--ink)]">
              Discard Session?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--body)] leading-relaxed mt-2">
            This will permanently erase this research session and all
            synthesized findings.
          </p>
          <div className="flex justify-end gap-3 pt-6">
            <button
              onClick={() => setShowDeleteDialog(null)}
              className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--ink)] rounded-[var(--rounded-md)] hover:bg-[var(--surface-soft)] transition-all"
            >
              Keep
            </button>
            <button
              onClick={() => {
                if (showDeleteDialog) {
                  deleteChat(showDeleteDialog);
                  setShowDeleteDialog(null);
                }
              }}
              className="px-6 py-2.5 rounded-[var(--rounded-md)] text-[11px] font-bold uppercase tracking-widest bg-[var(--error)] text-white hover:opacity-90 active:scale-95 transition-all"
            >
              Discard
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
