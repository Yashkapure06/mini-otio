"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowUp, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Globe,
  Microscope, 
  Cpu,
  Binary
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { messageInputSchema, ResponseStyle } from "@/lib/validators";
import {
  searchWithExa,
  streamWithAISDK,
  formatSourceCitations,
  generateRelatedQuestions,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const STYLE_OPTIONS: { label: string; icon: any; value: ResponseStyle }[] = [
  { label: "Default", icon: Sparkles, value: "default" },
  { label: "Summary", icon: BookOpen, value: "bullet summary" },
  { label: "Step-by-step", icon: Clock, value: "step-by-step" },
  { label: "Explain simply", icon: Globe, value: "explain like I'm 5" },
];

export function InputBox() {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "searching" | "verifying" | "extracting">("idle");
  const [isProMode, setIsProMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    selectedStyle,
    setSelectedStyle,
    addMessage,
    updateMessage,
    updateMessageStreaming,
    updateMessageSources,
    setStreaming,
    addRelatedQuestions,
    createNewChat,
    isStreaming,
    pendingQuery,
    setPendingQuery,
  } = useAppStore();

  const busy = isSubmitting || isStreaming;

  const statusText = (() => {
    if (phase === "searching") return "Mapping digital knowledge…";
    if (phase === "verifying") return "Authenticating research papers…";
    if (phase === "extracting") return "Finalizing synthesis…";
    if (busy) return "Reasoning…";
    return "";
  })();

  const currentStyle = STYLE_OPTIONS.find((o) => o.value === selectedStyle) ?? STYLE_OPTIONS[0];

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const clamped = Math.max(52, Math.min(el.scrollHeight, 200));
    el.style.height = `${clamped}px`;
    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => { resizeTextarea(); }, [query, resizeTextarea]);

  useEffect(() => {
    if (!pendingQuery) return;
    const q = pendingQuery;
    setPendingQuery("");
    setQuery(q);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [pendingQuery, setPendingQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuery = query.trim();
    if (!currentQuery || busy) return;
    setValidationError(null);

    try {
      const result = messageInputSchema.safeParse({ query: currentQuery, style: selectedStyle });
      if (!result.success) {
        setValidationError(result.error.errors[0]?.message ?? "Invalid input.");
        return;
      }

      if (!useAppStore.getState().currentChatId) createNewChat();

      setIsSubmitting(true);
      setStreaming(true);
      setPhase("searching");
      setQuery("");

      addMessage({ role: "user", content: currentQuery });
      addMessage({ role: "assistant", content: "", isStreaming: true });

      const currentMessages = useAppStore.getState().messages;
      const aMsg = currentMessages.find((m) => m.role === "assistant" && m.isStreaming);
      const aMsgId = aMsg?.id || "";

      // Build full conversation history (all settled messages, excl. the streaming placeholder)
      const conversationHistory = currentMessages
        .filter((m) => m.id !== aMsgId && m.content.trim())
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const searchResults = await searchWithExa(currentQuery);
      const sources = formatSourceCitations(searchResults.results);

      setPhase("extracting");
      await streamWithAISDK(
        conversationHistory,
        searchResults.results,
        selectedStyle,
        (token) => {
          if (aMsgId && typeof window !== "undefined") {
            (window as any).__streamingRefs?.get(aMsgId)?.appendToken(token);
          }
        },
        async () => {
          setStreaming(false);
          setPhase("idle");
          if (aMsgId) {
            const ref = (window as any).__streamingRefs?.get(aMsgId);
            const finalContent = ref?.getContent?.() ?? "";
            updateMessage(aMsgId, finalContent);
            updateMessageStreaming(aMsgId, false);
            updateMessageSources(aMsgId, sources, searchResults.results);
            const questions = await generateRelatedQuestions(finalContent, searchResults.results, currentQuery);
            addRelatedQuestions(aMsgId, questions);
          }
        },
        (error) => {
          setStreaming(false);
          setPhase("idle");
          if (aMsgId) {
            updateMessage(aMsgId, `**Error:** ${error}`);
            updateMessageStreaming(aMsgId, false);
          }
        }
      );
    } catch (err) {
      console.error("Submit error:", err);
      setStreaming(false);
      setPhase("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto">
      {/* Editorial Status Badge */}
      {busy && (
        <div className="flex justify-center mb-10 animate-editorial">
          <div className="bg-white border border-[var(--hairline)] px-6 py-2.5 rounded-full flex items-center gap-4 shadow-xl shadow-[rgba(0,0,0,0.03)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#CC785C] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--muted)]">{statusText}</span>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="relative">
        <div 
          className={cn(
            "relative rounded-[32px] border transition-all duration-500",
            "bg-white/80 backdrop-blur-xl border-[var(--hairline)] shadow-[0_30px_60px_rgba(0,0,0,0.06)]",
            busy ? "opacity-60 cursor-not-allowed" : "hover:border-[rgba(204,120,92,0.3)] focus-within:border-[#CC785C] focus-within:shadow-[0_30px_70px_rgba(204,120,92,0.12)]"
          )}
        >
          <div className="flex flex-col">
            <div className="px-10 pt-8">
              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                onInput={resizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
                placeholder="Initiate a research session..."
                className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-2 text-[20px] font-serif italic text-[var(--ink)] leading-relaxed placeholder:text-[var(--muted-soft)] focus:ring-0 focus:outline-none scrollbar-none"
                style={{ minHeight: 52 }}
                disabled={busy}
              />
            </div>

            <div className="flex items-center justify-between px-10 pb-8 pt-4">
              <div className="flex items-center gap-5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={busy}
                      className="btn-secondary h-11 px-6 min-w-0 bg-white"
                    >
                      <currentStyle.icon className="h-4 w-4 text-[#CC785C]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{currentStyle.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    sideOffset={12}
                    className="ddl w-72 p-2.5 bg-white border border-[var(--hairline)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-editorial"
                  >
                    <div className="px-4 py-2 mb-2 border-b border-[var(--hairline)]">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--muted-soft)]">Synthesis Mode</span>
                    </div>
                    {STYLE_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => setSelectedStyle(opt.value)}
                        className={cn(
                          "flex items-center gap-4 cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl px-4 py-3.5 transition-all mb-1 last:mb-0 group",
                          selectedStyle === opt.value
                            ? "bg-[var(--ink)] text-white shadow-lg"
                            : "hover:bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--ink)]"
                        )}
                      >
                        <opt.icon className={cn("h-4 w-4", selectedStyle === opt.value ? "text-[#CC785C]" : "text-[var(--muted-soft)] group-hover:text-[#CC785C]")} />
                        {opt.label}
                        {selectedStyle === opt.value && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#CC785C]" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-[var(--hairline)]" />
                
                <button
                  type="button"
                  onClick={() => setIsProMode(!isProMode)}
                  className={cn(
                    "h-11 px-5 rounded-full transition-all border flex items-center justify-center gap-3",
                    isProMode 
                      ? "text-[#CC785C] bg-[rgba(204,120,92,0.08)] border-[rgba(204,120,92,0.2)]" 
                      : "text-[var(--muted-soft)] border-transparent hover:text-[var(--ink)] hover:bg-white/60"
                  )}
                  title="Toggle Pro Research Mode"
                >
                  <Sparkles className={cn("h-4.5 w-4.5", isProMode ? "fill-current" : "")} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{isProMode ? "Pro Active" : "Pro Mode"}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={busy || !query.trim()}
                className={cn(
                  "btn-primary h-12 w-12 rounded-full p-0 min-w-0 flex items-center justify-center transition-all duration-500 shadow-xl shadow-[rgba(204,120,92,0.3)]",
                  busy || !query.trim()
                    ? "opacity-20 grayscale cursor-not-allowed"
                    : "hover:scale-110 active:scale-95"
                )}
              >
                {busy ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="h-6 w-6 stroke-[3.5px]" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Pro Mode Options */}
        {isProMode && (
          <div className="absolute -bottom-16 inset-x-0 flex justify-center gap-4 animate-editorial">
            {[
              { label: "Deep Analysis", icon: Microscope },
              { label: "Compute Engine", icon: Cpu },
              { label: "Logic Gate", icon: Binary },
            ].map((opt, i) => (
              <button
                key={i}
                type="button"
                className="bg-white border border-[var(--hairline)] px-6 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[#CC785C] hover:border-[#CC785C]/40 transition-all flex items-center gap-3 shadow-lg shadow-[rgba(0,0,0,0.04)]"
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}


