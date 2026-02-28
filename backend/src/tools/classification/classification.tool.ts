import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ClassificationService } from './classification.service';

export function createClassificationTool(
  classificationService: ClassificationService,
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'classify_ticket',
    description:
      'Classifies a support ticket into category, priority, and routing team. Use this FIRST for every ticket analysis.',
    schema: z.object({
      ticket_text: z
        .string()
        .describe('The support ticket text to classify'),
    }),
    func: async ({ ticket_text }) => {
      return classificationService.classify(ticket_text);
    },
  });
}
