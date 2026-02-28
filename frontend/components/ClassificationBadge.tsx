import { priorityStyles } from '@/lib/utils';

interface Props {
  priority: string;
  category?: string;
  team?: string;
}

export function ClassificationBadge({ priority, category, team }: Props) {
  const { bg, text, border } = priorityStyles(priority);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Priority */}
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bg} ${text} ${border}`}>
        {priority}
      </span>
      {/* Category */}
      {category && (
        <span className="inline-flex items-center rounded-full border border-border bg-hover px-2.5 py-0.5 text-xs font-medium text-foreground">
          {category}
        </span>
      )}
      {/* Team */}
      {team && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-hover px-2.5 py-0.5 text-xs text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {team}
        </span>
      )}
    </div>
  );
}
