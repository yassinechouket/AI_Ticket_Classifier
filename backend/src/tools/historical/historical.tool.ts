import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { HistoricalService } from './historical.service';

export function createHistoricalTool(
  historicalService: HistoricalService,
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'query_historical',
    description:
      'Queries historical resolved tickets using natural language to find similar past cases and their resolutions. Use this for complex P1/P2 issues or when additional context from past incidents would help.',
    schema: z.object({
      question: z
        .string()
        .describe(
          'Natural language question about historical tickets, e.g. "database outage" or "VPN connectivity issues"',
        ),
    }),
    func: async ({ question }) => {
      const results = await historicalService.query(question);
      return JSON.stringify(results, null, 2);
    },
  });
}
