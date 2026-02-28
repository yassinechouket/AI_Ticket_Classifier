/** Generate a short random thread ID */
export function generateThreadId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Get Tailwind colour classes for a priority string */
export function priorityStyles(priority: string): { bg: string; text: string; border: string } {
  if (priority?.startsWith('P1')) return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' };
  if (priority?.startsWith('P2')) return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
  if (priority?.startsWith('P3')) return { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' };
  if (priority?.startsWith('P4')) return { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' };
  return { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
}

/** Get Tailwind colour classes for a complexity level */
export function complexityStyles(complexity: string): { bg: string; text: string } {
  if (complexity === 'simple') return { bg: 'bg-blue-500/15', text: 'text-blue-400' };
  if (complexity === 'moderate') return { bg: 'bg-purple-500/15', text: 'text-purple-400' };
  if (complexity === 'complex') return { bg: 'bg-red-500/15', text: 'text-red-400' };
  return { bg: 'bg-slate-500/15', text: 'text-slate-400' };
}

/** Confidence percentage string */
export function confidencePct(value: number): string {
  return `${Math.round((value ?? 0) * 100)}%`;
}

/** Try to copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
