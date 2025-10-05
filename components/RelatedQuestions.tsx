"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface RelatedQuestionsProps {
  messageId: string;
  onQuestionClick: (question: string) => void;
}

export function RelatedQuestions({
  messageId,
  onQuestionClick,
}: RelatedQuestionsProps) {
  const { relatedQuestions, removeRelatedQuestions } = useAppStore();

  const messageRelatedQuestions = relatedQuestions.filter(
    (q) => q.messageId === messageId
  );

  if (messageRelatedQuestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Related questions:</span>
      </div>
      <div className="space-y-3">
        {messageRelatedQuestions.map((question) => (
          <Button
            key={question.id}
            variant="outline"
            className="w-full justify-between p-4 h-auto text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            onClick={() => onQuestionClick(question.text)}
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">
              {question.text}
            </span>
            <Plus className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
          </Button>
        ))}
      </div>
    </div>
  );
}
