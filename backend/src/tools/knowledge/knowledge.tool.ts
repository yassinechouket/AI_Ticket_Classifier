import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { VectorSearchService } from '../../vector-search/vector-search.service';

export function createKnowledgeTool(
  vectorSearchService: VectorSearchService,
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_knowledge',
    description:
      'Searches the knowledge base for relevant articles, documentation, and solutions using semantic vector search. Returns top matching documents with titles and content excerpts.',
    schema: z.object({
      query: z
        .string()
        .describe(
          'The search query to find relevant knowledge base documentation',
        ),
    }),
    func: async ({ query }) => {
      const results = await vectorSearchService.search(query, 3);
      return JSON.stringify(results, null, 2);
    },
  });
}
