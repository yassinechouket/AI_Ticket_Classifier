import {
  BaseCheckpointSaver,
  CompiledStateGraph,
  MessagesAnnotation,
} from '@langchain/langgraph';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentFactory } from '../agent.factory';
import { BaseMessage } from '@langchain/core/messages';
import { ModelProvider } from '../enum/model-provider.enum';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { postgresCheckpointer } from '../memory/memory';
import { ClassificationService } from '../../tools/classification/classification.service';
import { ExtractionService } from '../../tools/extraction/extraction.service';
import { HistoricalService } from '../../tools/historical/historical.service';
import { VectorSearchService } from '../../vector-search/vector-search.service';
import { createClassificationTool } from '../../tools/classification/classification.tool';
import { createExtractionTool } from '../../tools/extraction/extraction.tool';
import { createKnowledgeTool } from '../../tools/knowledge/knowledge.tool';
import { createHistoricalTool } from '../../tools/historical/historical.tool';

@Injectable()
export class ReactAgent implements OnModuleInit {
  private readonly logger = new Logger(ReactAgent.name);
  private readonly agent: CompiledStateGraph<
    typeof MessagesAnnotation,
    any
  >;
  private readonly checkpointer: BaseCheckpointSaver;

  constructor(
    private readonly classificationService: ClassificationService,
    private readonly extractionService: ExtractionService,
    private readonly historicalService: HistoricalService,
    private readonly vectorSearchService: VectorSearchService,
  ) {
    const tools = [
      createClassificationTool(this.classificationService),
      createExtractionTool(this.extractionService),
      createKnowledgeTool(this.vectorSearchService),
      createHistoricalTool(this.historicalService),
    ];

    this.agent = AgentFactory.createAgent(
      ModelProvider.AZURE_OPENAI,
      tools,
      postgresCheckpointer,
    );
    this.checkpointer = postgresCheckpointer;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing PostgresSaver checkpointer tables...');
    await this.initCheckpointer();
    this.logger.log('PostgresSaver checkpointer ready');
  }

  async chat(input: any, chatOptions: any): Promise<any> {
    const response = await this.agent.invoke(input, chatOptions);
    const messages =
      response && Array.isArray((response as any).messages)
        ? (response as { messages: any[] }).messages
        : null;
    return messages ? messages[messages.length - 1] : null;
  }

  async stream(input: any, chatOptions: any): Promise<any> {
    return this.agent.stream(input, chatOptions);
  }

  async getHistory(threadId: string): Promise<BaseMessage[]> {
    const history = await this.checkpointer.get({
      configurable: { thread_id: threadId },
    });
    return Array.isArray(history?.channel_values?.messages)
      ? history.channel_values.messages
      : [];
  }

  async initCheckpointer(): Promise<void> {
    if (this.checkpointer && this.checkpointer instanceof PostgresSaver) {
      try {
        await this.checkpointer.setup();
      } catch (err: any) {
        this.logger.error('Error setting up PostgresSaver:', err);
      }
    }
  }
}