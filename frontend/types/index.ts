export interface Classification {
  category: string;
  priority: string;
  assigned_team: string;
  confidence: number;
}

export interface TicketMetadata {
  priority_score: number;
  urgency_level: string;
  affected_systems: string[];
  technical_keywords: string[];
  user_impact: string;
  requires_escalation: boolean;
}

export interface KnowledgeArticle {
  title: string;
  relevance: string;
  key_steps: string[];
}

export interface HistoricalTicket {
  ticket_id: string;
  similarity: string;
  resolution: string;
}

export interface Recommendations {
  summary: string;
  immediate_actions: string[];
  resolution_steps: string[];
  estimated_resolution_time: string;
  escalation_needed: boolean;
}

export interface TicketAnalysisResponse {
  threadId: string;
  classification?: Classification;
  metadata?: TicketMetadata;
  knowledge_articles?: KnowledgeArticle[];
  historical_tickets?: HistoricalTicket[];
  recommendations?: Recommendations;
  tools_used?: string[];
  complexity_assessment?: string;
  raw_response?: string;
  processing_time_ms?: number;
}

export interface TicketSubmission {
  threadId: string;
  ticketText: string;
  requesterId?: string;
}

export interface MessageResponse {
  id: string;
  type: 'human' | 'ai' | 'tool';
  content: string | unknown[];
}

export interface HistoryEntry {
  id: string;
  threadId: string;
  ticketText: string;
  response: TicketAnalysisResponse;
  timestamp: string;
}

export type Theme = 'light' | 'dark';

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'unknown';
