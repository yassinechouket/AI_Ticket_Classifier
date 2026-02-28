"use client";

import { useState, useCallback } from "react";
import { QueryInput } from "@/components/QueryInput";
import { AgentResponseCard } from "@/components/AgentResponseCard";
import { Loader } from "@/components/Loader";
import { analyzeTicket } from "@/lib/api";
import { saveHistoryEntry } from "@/lib/history";
import { generateThreadId } from "@/lib/utils";
import type { TicketAnalysisResponse, TicketSubmission } from "@/types";

export default function AnalyzePage() {
  const [threadId, setThreadId] = useState<string>(() => generateThreadId());
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TicketAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNewThread = useCallback(() => {
    setThreadId(generateThreadId());
    setResponse(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (ticketText: string, _tid?: string) => {
      setLoading(true);
      setError(null);
      setResponse(null);

      const payload: TicketSubmission = { ticketText, threadId };

      try {
        const data = await analyzeTicket(payload);
        setResponse(data);
        saveHistoryEntry({ id: threadId, threadId, ticketText, response: data, timestamp: new Date().toISOString() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [threadId],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analyze Ticket</h1>
        <p className="text-sm text-muted mt-1">
          Paste a support ticket and let the agent classify, enrich, and route it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input panel */}
        <div className="sticky top-20">
          <QueryInput
            threadId={threadId}
            loading={loading}
            onNewThread={handleNewThread}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Output panel */}
        <div>
          {loading && (
            <div className="flex items-center justify-center h-64 rounded-xl border border-border bg-surface">
              <Loader label="Agent is reasoning…" />
            </div>
          )}

          {!loading && error && (
            <div className="p-5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                Request failed
              </p>
              <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            </div>
          )}

          {!loading && response && (
            <AgentResponseCard response={response} />
          )}

          {!loading && !error && !response && (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-border bg-surface text-center px-6">
              <svg
                className="w-8 h-8 text-muted mb-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm text-muted">
                Submit a ticket to see the agent&apos;s analysis here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
