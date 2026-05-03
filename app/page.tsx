"use client";

import { Chat } from "@/components/Chat";
import { InputBox } from "@/components/InputBox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";
import { Trash2, Menu, Plus, X, BarChart3, ArrowRight } from "lucide-react";
import { ModernSidebar } from "@/components/ModernSidebar";
import { ResearchDashboard } from "@/components/ResearchDashboard";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { label: "Deep dive into Quantum Computing", query: "Research Quantum Computing breakthroughs in 2024" },
  { label: "Analyze market trends in AI", query: "What are the top AI market trends for the next 5 years?" },
  { label: "Explain string theory simply", query: "Explain string theory like I'm five" },
  { label: "Draft a research proposal", query: "Help me draft a research proposal for sustainable energy" },
];

export default function Home() {
  const {
    messages,
    currentChatId,
    clearAllChats,
    createNewChat,
    isChatSidebarOpen,
    toggleChatSidebar,
    initializeStore,
    setPendingQuery,
    isDashboardOpen,
    toggleDashboard,
    dashboardView,
    setDashboardView,
  } = useAppStore();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        createNewChat();
      }
      if (e.key === "Escape") {
        if (isDashboardOpen) toggleDashboard();
        else if (isChatSidebarOpen) toggleChatSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createNewChat, isChatSidebarOpen, toggleChatSidebar, isDashboardOpen, toggleDashboard]);

  const hasChatSession = currentChatId !== null;
  const isEmpty = messages.length === 0;

  const SidebarOverlay = () =>
    isChatSidebarOpen ? (
      <div
        className="md:hidden fixed inset-0 z-[60] bg-[var(--ink)]/10 backdrop-blur-sm transition-all duration-300"
        onClick={toggleChatSidebar}
      >
        <div
          className="absolute left-0 top-0 h-full w-[280px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <ModernSidebar />
        </div>
      </div>
    ) : null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen flex bg-[var(--canvas)] text-[var(--body)] overflow-hidden antialiased font-body">
        
        {/* Desktop sidebar */}
        <aside className={cn(
          "hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out border-r border-[var(--hairline)]",
          isChatSidebarOpen ? "w-[280px]" : "w-0 overflow-hidden border-none"
        )}>
          <div className="w-[280px] h-full">
            <ModernSidebar />
          </div>
        </aside>

        <SidebarOverlay />

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Main Header - Clean & Floating */}
          <header className={cn(
            "sticky top-0 z-50 px-8 flex items-center justify-between h-20 transition-all duration-300 bg-[var(--canvas)]",
            scrolled || (hasChatSession && !isEmpty) ? "border-b border-[var(--hairline)] bg-white/80 backdrop-blur-md" : "bg-transparent"
          )}>
            <div className="flex items-center gap-6">
              {!isChatSidebarOpen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleChatSidebar}
                      className="p-2.5 rounded-[var(--rounded-md)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)] transition-all"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Open Navigation</TooltipContent>
                </Tooltip>
              )}
              
              {!isChatSidebarOpen && (
                <div className="flex items-center gap-3 animate-editorial">
                  <div className="spike-mark scale-90" />
                  <span className="text-xl font-serif font-medium tracking-tight text-[var(--ink)]">OTIO</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {hasChatSession && !isEmpty && (
                <div className="flex items-center gap-4 animate-editorial">
                  <button
                    onClick={() => {
                      setDashboardView("metrics");
                      if (!isDashboardOpen) toggleDashboard();
                    }}
                    className={cn(
                      "btn-secondary h-11 px-6",
                      isDashboardOpen && dashboardView === "metrics" && "bg-[var(--ink)] text-white border-[var(--ink)]"
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Intelligence</span>
                  </button>

                  <div className="h-5 w-px bg-[var(--hairline)]" />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={clearAllChats}
                        className="h-10 w-10 flex items-center justify-center rounded-xl text-[var(--muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/5 transition-all border border-transparent hover:border-[var(--error)]/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Discard Findings</TooltipContent>
                  </Tooltip>
                </div>
              )}
              
              <button
                onClick={() => createNewChat()}
                className="btn-primary h-11 px-8"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            </div>
          </header>

          {/* Main Viewport */}
          <main className="flex-1 relative flex overflow-hidden">
            <div className={cn(
              "flex-1 flex flex-col min-h-0 transition-all duration-700 ease-in-out",
              isDashboardOpen ? "mr-[400px]" : "mr-0"
            )}>
              {!hasChatSession || isEmpty ? (
                /* Landing - Premium Center Stage */
                <div className="flex-1 overflow-y-auto scrollbar-none">
                  <div className="min-h-full flex flex-col items-center justify-center px-8 py-20 animate-editorial">
                    <div className="w-full max-w-4xl space-y-20">
                      <div className="text-center space-y-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-[var(--hairline)] text-[var(--muted)] text-[10px] font-bold uppercase tracking-[0.3em] shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#CC785C] animate-pulse" />
                          Academic Intelligence
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif text-[var(--ink)] leading-[1.1] tracking-tight">
                          Meet your deep <br />
                          <span className="italic text-[#CC785C]">thinking partner.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[var(--body)] max-w-2xl mx-auto leading-relaxed opacity-80">
                          OTIO synthesizes the collective knowledge of the web into deep, literary-grade research papers. Designed for high-stakes analysis.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {SUGGESTIONS.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              createNewChat();
                              setPendingQuery(s.label);
                            }}
                            className="group p-10 card-pro text-left hover:border-[#CC785C]/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between h-48 bg-white/50 backdrop-blur-sm"
                          >
                            <p className="text-[22px] font-serif italic text-[var(--ink)] leading-tight">
                              "{s.label}"
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-[#CC785C] uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-all duration-300">
                              Initiate Research <ArrowRight className="h-4 w-4" />
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-center pt-16 border-t border-[var(--hairline)]">
                        <div className="flex items-center gap-12 opacity-40">
                          <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-[var(--muted)]">Neural Synthesis Engine v4.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Container */
                <div className="flex-1 overflow-hidden">
                  <Chat />
                </div>
              )}
            </div>

            {/* Dashboard Sidebar - Right Panel */}
            <aside className={cn(
              "fixed right-0 top-0 bottom-0 w-[400px] bg-[var(--surface-dark)] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) z-40 shadow-2xl border-l border-white/5",
              isDashboardOpen ? "translate-x-0" : "translate-x-full"
            )}>
              {isDashboardOpen && (
                <div className="h-full flex flex-col">
                  <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[rgba(23,23,28,0.5)] backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="spike-mark bg-white scale-75 opacity-50" />
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
                        {dashboardView === "archives" ? "Archives" : "Research Intelligence"}
                      </h2>
                    </div>
                    <button
                      onClick={toggleDashboard}
                      className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-none">
                    <ResearchDashboard />
                  </div>
                </div>
              )}
            </aside>
          </main>

          {/* Persistent Footer Input */}
          <footer className="flex-shrink-0 relative z-30 pb-10 bg-gradient-to-t from-[var(--canvas)] via-[var(--canvas)] to-transparent pt-10">
            <div className="max-w-4xl mx-auto px-8">
              <InputBox />
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}



