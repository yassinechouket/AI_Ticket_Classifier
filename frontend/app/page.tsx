import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Smart Classification",
    desc: "Auto-detects category, priority, and owning team using a fine-tuned reasoning chain.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    ),
    title: "Metadata Extraction",
    desc: "Pulls urgency, affected systems, user impact, and solution ETA from free-form text.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
    ),
    title: "Knowledge Search",
    desc: "Semantic search over your knowledge base via Qdrant to surface relevant articles.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Historical Analysis",
    desc: "Matches similar past tickets and surfaces their resolutions to speed up triage.",
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Hero */}
      <div className="mb-16 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border text-muted mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Powered by GPT-4o + LangGraph ReAct
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          AI Ticket Classifier
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto leading-relaxed">
          An adaptive ReAct agent that classifies, enriches, and routes support
          tickets using multi-step reasoning, semantic search, and historical context.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/analyze"
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Analyze a ticket
          </Link>
          <Link
            href="/history"
            className="px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-hover transition-colors"
          >
            View history
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-5 rounded-xl border border-border bg-surface hover:bg-hover transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-primary">{f.icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture note */}
      <div className="mt-12 p-5 rounded-xl border border-border bg-surface">
        <h2 className="text-sm font-semibold text-foreground mb-3">How it works</h2>
        <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
          <li>Submit a ticket description with an optional thread ID for conversation continuity.</li>
          <li>The ReAct agent reasons step-by-step, choosing which tools to invoke and when.</li>
          <li>Classification, extraction, knowledge search, and historical lookup run in parallel.</li>
          <li>Results are merged into a structured response with actionable recommendations.</li>
        </ol>
      </div>
    </div>
  );
}
