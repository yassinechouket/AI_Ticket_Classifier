import type {
  TicketSubmission,
  TicketAnalysisResponse,
  MessageResponse,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Request failed: ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

/** Submit a ticket to the adaptive AI agent for full analysis */
export function analyzeTicket(
  payload: TicketSubmission,
): Promise<TicketAnalysisResponse> {
  return request<TicketAnalysisResponse>('/api/agent/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Retrieve conversation history for a thread from the backend */
export function getThreadHistory(
  threadId: string,
): Promise<MessageResponse[]> {
  return request<MessageResponse[]>(
    `/api/agent/history/${encodeURIComponent(threadId)}`,
  );
}
