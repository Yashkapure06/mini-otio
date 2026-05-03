"use client";

import { useState } from "react";
import { X, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResearchFilter {
  id: string;
  label: string;
  type: "source" | "topic" | "confidence" | "date" | "tag";
}

interface ResearchFiltersProps {
  filters: ResearchFilter[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onClearAll?: () => void;
  groupByType?: boolean;
}

export function ResearchFilters({
  filters,
  selectedFilters,
  onFilterToggle,
  onClearAll,
  groupByType = true,
}: ResearchFiltersProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set(["topic", "source"])
  );

  const toggleTypeExpansion = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const groupedFilters = groupByType
    ? filters.reduce(
        (acc, filter) => {
          if (!acc[filter.type]) acc[filter.type] = [];
          acc[filter.type].push(filter);
          return acc;
        },
        {} as Record<string, ResearchFilter[]>
      )
    : { all: filters };

  const filterGroups = Object.entries(groupedFilters);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-[#CC785C]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">Refine Trajectory</h3>
        </div>
        {selectedFilters.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold uppercase tracking-widest text-[#CC785C] hover:opacity-70 transition-opacity"
          >
            Reset ({selectedFilters.length})
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-6">
        {filterGroups.map(([type, typeFilters]) => (
          <div key={type} className="space-y-4">
            {groupByType && typeFilters.length > 0 && (
              <button
                onClick={() => toggleTypeExpansion(type)}
                className="flex items-center gap-3 w-full text-left group"
              >
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform text-[var(--muted-soft)]",
                    expandedTypes.has(type) ? "" : "-rotate-90"
                  )}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-soft)] group-hover:text-[var(--ink)] transition-colors">
                  {type}
                </span>
              </button>
            )}

            {expandedTypes.has(type) && (
              <div className="grid grid-cols-1 gap-2">
                {typeFilters.map((filter) => {
                  const isSelected = selectedFilters.includes(filter.id);

                  return (
                    <button
                      key={filter.id}
                      onClick={() => onFilterToggle(filter.id)}
                      className={cn(
                        "relative flex items-center justify-between px-4 py-3 rounded-[var(--rounded-md)] text-[13px] font-serif transition-all border",
                        isSelected
                          ? "bg-[rgba(204,120,92,0.1)] border-[rgba(204,120,92,0.3)] text-[#CC785C] italic"
                          : "bg-white border-[var(--hairline)] text-[var(--body)] hover:bg-[var(--surface-soft)]"
                      )}
                    >
                      <span>{filter.label}</span>
                      {isSelected && <X className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
