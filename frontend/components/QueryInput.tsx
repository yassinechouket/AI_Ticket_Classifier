'use client';

import { useState } from 'react';

interface QueryInputProps {
  onSubmit: (ticketText: string, threadId: string) => void;
  loading: boolean;
  threadId: string;
  onNewThread: () => void;
}

const EXAMPLE_TICKETS = [
  'Production database is down, all services affected since 9AM. Users cannot access the application.',
  'Suspected unauthorized access to admin accounts. Logs show multiple failed login attempts from unknown IPs.',
  'VPN connectivity failing for all remote employees since the certificate renewal last night.',
];

export function QueryInput({
  onSubmit,
  loading,
  threadId,
  onNewThread,
}: QueryInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed, threadId);
  };

  const fillExample = (example: string) => {
    setText(example);
  };

  const charLimit = 2000;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Thread ID row */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-xs text-muted">
        <span>
          <span className="font-medium text-foreground">Thread ID:</span>{' '}
          <code className="font-mono">{threadId}</code>
        </span>
        <button
          type="button"
          onClick={onNewThread}
          disabled={loading}
          className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
        >
          New thread
        </button>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, charLimit))}
          placeholder="Describe the IT support ticket or issue…"
          rows={6}
          disabled={loading}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
        />
        <span className="absolute bottom-3 right-3 text-xs text-muted/50">
          {text.length}/{charLimit}
        </span>
      </div>

      {/* Example buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted self-center">Examples:</span>
        {EXAMPLE_TICKETS.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => fillExample(ex)}
            disabled={loading}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40 text-left"
          >
            {ex.slice(0, 40)}…
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyzing…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Analyze Ticket
          </>
        )}
      </button>
    </form>
  );
}
