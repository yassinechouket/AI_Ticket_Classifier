'use client';

import { useState } from 'react';
import type { TicketAnalysisResponse } from '@/types';
import { ClassificationBadge } from './ClassificationBadge';
import { complexityStyles, confidencePct, copyToClipboard } from '@/lib/utils';

interface Props {
  response: TicketAnalysisResponse;
  ticketText?: string;
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-hover px-2 py-0.5 text-xs text-muted">
      {label}
    </span>
  );
}

function StepList({ steps }: { steps: string[] }) {
  if (!steps?.length) return <p className="text-xs text-muted">None</p>;
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2 text-xs text-foreground/80">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-[10px]">
            {i + 1}
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function AgentResponseCard({ response, ticketText }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(
      JSON.stringify(response, null, 2),
    );
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { classification, metadata, recommendations, knowledge_articles, historical_tickets, tools_used, complexity_assessment, processing_time_ms } = response;
  const complexity = complexityStyles(complexity_assessment ?? '');

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-2">
          {classification && (
            <ClassificationBadge
              priority={classification.priority}
              category={classification.category}
              team={classification.assigned_team}
            />
          )}
          {classification && (
            <p className="text-xs text-muted">
              Confidence:{' '}
              <span className="font-semibold text-foreground">
                {confidencePct(classification.confidence)}
              </span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {complexity_assessment && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${complexity.bg} ${complexity.text}`}>
              {complexity_assessment}
            </span>
          )}
          {processing_time_ms !== undefined && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
              {(processing_time_ms / 1000).toFixed(1)}s
            </span>
          )}
          <button
            onClick={handleCopy}
            title="Copy JSON"
            className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground hover:bg-hover transition-colors"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Metadata ── */}
      {metadata && (
        <Section title="Metadata" icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        }>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div>
              <span className="text-muted">Urgency</span>
              <p className="font-medium text-foreground">{metadata.urgency_level}</p>
            </div>
            <div>
              <span className="text-muted">User Impact</span>
              <p className="font-medium text-foreground">{metadata.user_impact}</p>
            </div>
            <div>
              <span className="text-muted">Priority Score</span>
              <p className="font-medium text-foreground">{Math.round(metadata.priority_score * 100)}%</p>
            </div>
            <div>
              <span className="text-muted">Escalation</span>
              <p className={`font-semibold ${metadata.requires_escalation ? 'text-red-400' : 'text-green-400'}`}>
                {metadata.requires_escalation ? 'Required' : 'Not required'}
              </p>
            </div>
          </div>
          {metadata.affected_systems?.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-muted">Affected Systems</p>
              <div className="flex flex-wrap gap-1">
                {metadata.affected_systems.map((s) => <Tag key={s} label={s} />)}
              </div>
            </div>
          )}
          {metadata.technical_keywords?.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-muted">Keywords</p>
              <div className="flex flex-wrap gap-1">
                {metadata.technical_keywords.map((k) => <Tag key={k} label={k} />)}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── Recommendations ── */}
      {recommendations && (
        <Section title="Recommendations" icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        }>
          {recommendations.summary && (
            <p className="mb-4 text-sm text-foreground/90 leading-relaxed">
              {recommendations.summary}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wide">Immediate Actions</p>
              <StepList steps={recommendations.immediate_actions} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wide">Resolution Steps</p>
              <StepList steps={recommendations.resolution_steps} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <span className="text-xs text-muted">
              ETA:{' '}
              <span className="font-medium text-foreground">
                {recommendations.estimated_resolution_time}
              </span>
            </span>
            {recommendations.escalation_needed && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Escalation Required
              </span>
            )}
          </div>
        </Section>
      )}

      {/* ── Knowledge Articles ── */}
      {knowledge_articles && knowledge_articles.length > 0 && (
        <Section title={`Knowledge Articles (${knowledge_articles.length})`} icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        }>
          <div className="flex flex-col gap-3">
            {knowledge_articles.map((article, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground">{article.title}</p>
                {article.relevance && (
                  <p className="mt-0.5 text-xs text-muted line-clamp-2">{article.relevance}</p>
                )}
                {article.key_steps?.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {article.key_steps.slice(0, 3).map((step, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-foreground/70">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        {step}
                      </li>
                    ))}
                    {article.key_steps.length > 3 && (
                      <li className="text-xs text-muted">+{article.key_steps.length - 3} more steps</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Historical Tickets ── */}
      {historical_tickets && historical_tickets.length > 0 && (
        <Section title={`Similar Past Incidents (${historical_tickets.length})`} icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
        }>
          <div className="flex flex-col gap-2">
            {historical_tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-primary">{ticket.ticket_id}</code>
                  <span className="text-xs text-muted">{ticket.similarity}</span>
                </div>
                <p className="mt-1 text-xs text-foreground/80 leading-relaxed">{ticket.resolution}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Footer: tools used ── */}
      {tools_used && tools_used.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
          <span className="text-xs text-muted">Tools used:</span>
          {tools_used.map((tool) => (
            <span key={tool} className="flex items-center gap-1 rounded-md border border-border bg-hover px-2 py-0.5 text-xs text-foreground/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
