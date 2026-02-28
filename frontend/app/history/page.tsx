"use client";

import { useEffect, useState } from "react";
import { loadHistory, clearHistory } from "@/lib/history";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { AgentResponseCard } from "@/components/AgentResponseCard";
import type { HistoryEntry } from "@/types";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
    setExpanded(null);
  };

  if (entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <svg
          className="w-10 h-10 text-muted mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-foreground font-medium mb-1">No history yet</p>
        <p className="text-sm text-muted">
          Analyses you run on the Analyze page will be saved here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-sm text-muted mt-1">{entries.length} saved analysis</p>
        </div>
        <button
          onClick={handleClear}
          className="px-3.5 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-red-500 hover:border-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const cls = entry.response.classification;
          const isOpen = expanded === entry.threadId;

          return (
            <div
              key={entry.threadId}
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              {/* Summary row */}
              <button
                className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-hover transition-colors"
                onClick={() => setExpanded(isOpen ? null : entry.threadId)}
              >
                {/* Left: text preview */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {entry.ticketText}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Thread: <span className="font-mono">{entry.threadId}</span>
                    {" · "}
                    {timeAgo(entry.timestamp)}
                  </p>
                </div>

                {/* Right: badges */}
                <div className="flex items-center gap-2 shrink-0">
                  {cls && (
                      <ClassificationBadge priority={cls.priority} category={cls.category} />
                  )}
                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-border px-5 py-5">
                  <AgentResponseCard response={entry.response} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
