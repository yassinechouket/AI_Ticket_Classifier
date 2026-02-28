import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ExtractionService } from './extraction.service';

export function createExtractionTool(
  extractionService: ExtractionService,
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'extract_metadata',
    description:
      'Extracts detailed metadata from a support ticket including priority score, urgency level, affected systems, technical keywords, user impact, and escalation requirements. Use after classification.',
    schema: z.object({
      ticket_text: z
        .string()
        .describe('The support ticket text to extract metadata from'),
    }),
    func: async ({ ticket_text }) => {
      return extractionService.extract(ticket_text);
    },
  });
}
