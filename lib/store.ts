import { create } from "zustand";

export interface SourceCitation {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  relevanceScore: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: SourceCitation[];
  searchResults?: any[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  relatedQuestions: RelatedQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  text: string;
  messageId: string;
  timestamp: Date;
}

export interface Bookmark {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  messageId: string;
  timestamp: Date;
}

export interface RelatedQuestion {
  id: string;
  text: string;
  messageId: string;
}

export type ResponseStyle =
  | "default"
  | "step-by-step"
  | "bullet summary"
  | "explain like I'm 5";

interface AppState {
  // Current chat session
  currentChatId: string | null;
  chatSessions: ChatSession[];

  // Current session data (computed from currentChatId)
  messages: Message[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  relatedQuestions: RelatedQuestion[];

  // UI state
  selectedStyle: ResponseStyle;
  isStreaming: boolean;
  isSidebarOpen: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  isChatSidebarOpen: boolean;

  // Message actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, content: string) => void;
  updateMessageStreaming: (id: string, isStreaming: boolean) => void;
  updateMessageSources: (
    id: string,
    sources: SourceCitation[],
    searchResults: any[]
  ) => void;
  setStreaming: (isStreaming: boolean) => void;

  // Highlight actions
  addHighlight: (highlight: Omit<Highlight, "id" | "timestamp">) => void;
  removeHighlight: (id: string) => void;

  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, "id" | "timestamp">) => void;
  removeBookmark: (id: string) => void;

  // Related questions actions
  addRelatedQuestions: (messageId: string, questions: string[]) => void;
  removeRelatedQuestions: (messageId: string) => void;

  // Chat session actions
  createNewChat: () => string;
  switchToChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;

  // UI actions
  setSelectedStyle: (style: ResponseStyle) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleChatSidebar: () => void;
  initializeSidebar: () => void;

  // Export actions
  exportConversation: () => void;
  exportHighlights: () => void;
  clearCurrentChat: () => void;
  clearAllChats: () => void;
  initializeStore: () => void;
}

// Helper function to save chat sessions to localStorage
const saveChatSessions = (sessions: ChatSession[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }
};

// Helper function to sync current session data
const syncCurrentSessionData = (state: AppState) => {
  const { currentChatId, chatSessions } = state;
  const currentChat = chatSessions.find((chat) => chat.id === currentChatId);

  return {
    messages: currentChat?.messages || [],
    highlights: currentChat?.highlights || [],
    bookmarks: currentChat?.bookmarks || [],
    relatedQuestions: currentChat?.relatedQuestions || [],
  };
};
/**
 * useAppStore
 * @param set
 * @param get
 * @returns
 * @description: This function is the main store for the app, using zustand it makes the state management easier. Using zustand because it is a lightweight state management library.
 */

export const useAppStore = create<AppState>((set, get) => ({
  // Chat session state
  currentChatId: null,
  chatSessions: [],

  // Current session data (computed from currentChatId)
  messages: [],
  highlights: [],
  bookmarks: [],
  relatedQuestions: [],

  // UI state
  selectedStyle: "default",
  isStreaming: false,
  isSidebarOpen: true,
  searchQuery: "",
  isSearchOpen: false,
  isChatSidebarOpen: false,

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              updatedAt: new Date(),
            }
          : chat
      );

      saveChatSessions(updatedSessions);
      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  updateMessage: (id, content) => {
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === id ? { ...msg, content } : msg
              ),
              updatedAt: new Date(),
            }
          : chat
      );

      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  updateMessageStreaming: (id, isStreaming) => {
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === id ? { ...msg, isStreaming } : msg
              ),
              updatedAt: new Date(),
            }
          : chat
      );

      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  updateMessageSources: (id, sources, searchResults) => {
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === id ? { ...msg, sources, searchResults } : msg
              ),
              updatedAt: new Date(),
            }
          : chat
      );

      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  setStreaming: (isStreaming) => {
    set({ isStreaming });
  },

  addHighlight: (highlight) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              highlights: [...chat.highlights, newHighlight],
              updatedAt: new Date(),
            }
          : chat
      );

      saveChatSessions(updatedSessions);

      // Also save to localStorage as a separate array for easy access
      const existingHighlights = JSON.parse(
        localStorage.getItem("app-highlights") || "[]"
      );
      const updatedHighlights = [...existingHighlights, newHighlight];
      localStorage.setItem("app-highlights", JSON.stringify(updatedHighlights));

      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  removeHighlight: (id) => {
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              highlights: chat.highlights.filter((h) => h.id !== id),
              updatedAt: new Date(),
            }
          : chat
      );

      saveChatSessions(updatedSessions);

      // Also remove from localStorage
      const existingHighlights = JSON.parse(
        localStorage.getItem("app-highlights") || "[]"
      );
      const updatedHighlights = existingHighlights.filter(
        (h: Highlight) => h.id !== id
      );
      localStorage.setItem("app-highlights", JSON.stringify(updatedHighlights));

      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  addBookmark: (bookmark) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              bookmarks: [...chat.bookmarks, newBookmark],
              updatedAt: new Date(),
            }
          : chat
      );

      saveChatSessions(updatedSessions);
      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  removeBookmark: (id) => {
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              bookmarks: chat.bookmarks.filter((b) => b.id !== id),
              updatedAt: new Date(),
            }
          : chat
      );

      saveChatSessions(updatedSessions);
      const newState = { ...state, chatSessions: updatedSessions };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  setSelectedStyle: (style) => {
    set({ selectedStyle: style });
  },

  addRelatedQuestions: (messageId, questions) => {
    const newRelatedQuestions: RelatedQuestion[] = questions.map(
      (question) => ({
        id: Math.random().toString(36).substr(2, 9),
        text: question,
        messageId,
      })
    );
    set((state) => ({
      relatedQuestions: [...state.relatedQuestions, ...newRelatedQuestions],
    }));
  },

  removeRelatedQuestions: (messageId) => {
    set((state) => ({
      relatedQuestions: state.relatedQuestions.filter(
        (q) => q.messageId !== messageId
      ),
    }));
  },

  clearMessages: () => {
    set({ messages: [], relatedQuestions: [] });
  },

  toggleSidebar: () => {
    set((state) => {
      const newState = !state.isSidebarOpen;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebarOpen", newState.toString());
      }
      return { isSidebarOpen: newState };
    });
  },

  initializeSidebar: () => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        set({ isSidebarOpen: savedState !== "false" });
      }
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSearchOpen: (isOpen) => {
    set({ isSearchOpen: isOpen });
  },

  exportConversation: () => {
    const state = useAppStore.getState();
    const conversation = state.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      sources: msg.sources || [],
    }));

    const blob = new Blob([JSON.stringify(conversation, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportHighlights: () => {
    const state = useAppStore.getState();
    const highlights = state.highlights.map((highlight) => ({
      text: highlight.text,
      timestamp: highlight.timestamp.toISOString(),
      messageId: highlight.messageId,
    }));

    const blob = new Blob([JSON.stringify(highlights, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `highlights-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * createNewChat
   * @returns
   * @description: This function creates a new chat session, it is used to create a new chat session when the user clicks the new chat button.
   */

  createNewChat: () => {
    const newChatId = crypto.randomUUID();
    const newChat: ChatSession = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      highlights: [],
      bookmarks: [],
      relatedQuestions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedSessions = [newChat, ...state.chatSessions];
      saveChatSessions(updatedSessions);
      const newState = {
        ...state,
        chatSessions: updatedSessions,
        currentChatId: newChatId,
      };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });

    return newChatId;
  },

  switchToChat: (chatId) => {
    set((state) => {
      const newState = { ...state, currentChatId: chatId };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  deleteChat: (chatId) => {
    set((state) => {
      const updatedSessions = state.chatSessions.filter(
        (chat) => chat.id !== chatId
      );
      const newCurrentChatId =
        state.currentChatId === chatId
          ? updatedSessions[0]?.id || null
          : state.currentChatId;

      saveChatSessions(updatedSessions);
      const newState = {
        ...state,
        chatSessions: updatedSessions,
        currentChatId: newCurrentChatId,
      };
      return {
        ...newState,
        ...syncCurrentSessionData(newState),
      };
    });
  },

  updateChatTitle: (chatId, title) => {
    set((state) => {
      const updatedSessions = state.chatSessions.map((chat) =>
        chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
      );
      saveChatSessions(updatedSessions);
      return { chatSessions: updatedSessions };
    });
  },

  toggleChatSidebar: () => {
    set((state) => ({ isChatSidebarOpen: !state.isChatSidebarOpen }));
  },

  clearCurrentChat: () => {
    set((state) => {
      const { currentChatId, chatSessions } = state;
      if (!currentChatId) return state;

      const updatedSessions = chatSessions.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [],
              highlights: [],
              bookmarks: [],
              relatedQuestions: [],
              updatedAt: new Date(),
            }
          : chat
      );

      saveChatSessions(updatedSessions);
      return { chatSessions: updatedSessions };
    });
  },

  clearAllChats: () => {
    set(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("chatSessions");
      }
      return {
        chatSessions: [],
        currentChatId: null,
        messages: [],
        highlights: [],
        bookmarks: [],
        relatedQuestions: [],
      };
    });
  },

  initializeStore: () => {
    if (typeof window !== "undefined") {
      const savedChatSessions = localStorage.getItem("chatSessions");
      if (savedChatSessions) {
        try {
          const parsedSessions = JSON.parse(savedChatSessions).map(
            (chat: any) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
            })
          );

          set((state) => {
            const newState = { ...state, chatSessions: parsedSessions };
            // Set the first chat as current if none is selected
            if (parsedSessions.length > 0 && !state.currentChatId) {
              newState.currentChatId = parsedSessions[0].id;
            }

            // Load highlights from localStorage
            const savedHighlights = JSON.parse(
              localStorage.getItem("app-highlights") || "[]"
            );

            return {
              ...newState,
              ...syncCurrentSessionData(newState),
              highlights: savedHighlights,
            };
          });
        } catch (error) {
          console.error("Error parsing saved chat sessions:", error);
        }
      }
    }
  },
}));
