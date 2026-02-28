import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClassificationDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  priority: string;

  @ApiProperty()
  assigned_team: string;

  @ApiProperty()
  confidence: number;
}

export class MetadataDto {
  @ApiProperty()
  priority_score: number;

  @ApiProperty()
  urgency_level: string;

  @ApiProperty({ type: [String] })
  affected_systems: string[];

  @ApiProperty({ type: [String] })
  technical_keywords: string[];

  @ApiProperty()
  user_impact: string;

  @ApiProperty()
  requires_escalation: boolean;
}

export class KnowledgeArticleDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  relevance: string;

  @ApiProperty({ type: [String] })
  key_steps: string[];
}

export class HistoricalTicketDto {
  @ApiProperty()
  ticket_id: string;

  @ApiProperty()
  similarity: string;

  @ApiProperty()
  resolution: string;
}

export class RecommendationsDto {
  @ApiProperty()
  summary: string;

  @ApiProperty({ type: [String] })
  immediate_actions: string[];

  @ApiProperty({ type: [String] })
  resolution_steps: string[];

  @ApiProperty()
  estimated_resolution_time: string;

  @ApiProperty()
  escalation_needed: boolean;
}

export class TicketAnalysisResponseDto {
  @ApiProperty()
  threadId: string;

  @ApiPropertyOptional({ type: ClassificationDto })
  classification?: ClassificationDto;

  @ApiPropertyOptional({ type: MetadataDto })
  metadata?: MetadataDto;

  @ApiPropertyOptional({ type: [KnowledgeArticleDto] })
  knowledge_articles?: KnowledgeArticleDto[];

  @ApiPropertyOptional({ type: [HistoricalTicketDto] })
  historical_tickets?: HistoricalTicketDto[];

  @ApiPropertyOptional({ type: RecommendationsDto })
  recommendations?: RecommendationsDto;

  @ApiProperty({ type: [String] })
  tools_used: string[];

  @ApiProperty()
  complexity_assessment: string;

  @ApiProperty()
  raw_response: string;

  @ApiProperty()
  processing_time_ms: number;
}
