"use client";

import { useAppStore } from "@/lib/store";
import { MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedQuestionsProps {
  messageId: string;
  onQuestionClick: (question: string) => void;
}

export function RelatedQuestions({
  messageId,
  onQuestionClick,
}: RelatedQuestionsProps) {
  const { relatedQuestions } = useAppStore();

  const messageRelatedQuestions = relatedQuestions.filter(
    (q) => q.messageId === messageId
  );

  if (messageRelatedQuestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 pt-16 border-t border-[var(--hairline)]">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[rgba(204,120,92,0.1)] flex items-center justify-center border border-[rgba(204,120,92,0.2)]">
          <MessageSquare className="h-4 w-4 text-[#CC785C]" />
        </div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--ink)]">Suggested Research Trajectories</h4>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {messageRelatedQuestions.map((question) => (
          <button
            key={question.id}
            onClick={() => onQuestionClick(question.text)}
            className={cn(
              "group w-full flex items-center justify-between p-6 text-left transition-all duration-500 card-pro",
              "hover:border-[#CC785C]/40"
            )}
          >
            <span className="text-[17px] font-serif italic text-[var(--ink)] leading-snug group-hover:text-[#CC785C] transition-colors pr-10">
              "{question.text}"
            </span>
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 flex-shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CC785C]">Investigate Node</span>
              <div className="w-8 h-8 rounded-full bg-[#CC785C] flex items-center justify-center shadow-lg shadow-[rgba(204,120,92,0.3)]">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
