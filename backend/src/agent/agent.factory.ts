import { AzureChatOpenAI } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import * as dotenv from 'dotenv';
import { ModelProvider } from './enum/model-provider.enum';
import { ReactAgentBuilder } from './agent.builder';
import { CompiledStateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

dotenv.config();

export class AgentFactory {
  public static createAgent(
    modelProvider: ModelProvider,
    tools: any[],
    checkpointer?: PostgresSaver,
  ): CompiledStateGraph<typeof MessagesAnnotation, any> {
    if (!modelProvider) {
      throw new Error('Model provider is required');
    }

    switch (modelProvider) {
      case ModelProvider.OPENAI: {
        return new ReactAgentBuilder(
          tools,
          new ChatOpenAI({
            model: process.env.OPENAI_MODEL,
          }),
        ).build(checkpointer);
      }
      case ModelProvider.GOOGLE: {
        return new ReactAgentBuilder(
          tools,
          new ChatGoogleGenerativeAI({
            model: process.env.GOOGLE_GENAI_MODEL || '',
          }),
        ).build(checkpointer);
      }
      case ModelProvider.AZURE_OPENAI: {
        return new ReactAgentBuilder(
          tools,
          new AzureChatOpenAI({
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiInstanceName: AgentFactory.extractInstanceName(
              process.env.AZURE_OPENAI_ENDPOINT || '',
            ),
            azureOpenAIApiDeploymentName:
              process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
            azureOpenAIApiVersion:
              process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
            temperature: 0.1,
            maxTokens: 4000,
          }),
        ).build(checkpointer);
      }
    }
  }

  private static extractInstanceName(endpoint: string): string {
    const match = endpoint.match(
      /https:\/\/([^.]+)\.openai\.azure\.com/,
    );
    return match ? match[1] : endpoint;
  }
}
