import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingModule } from './messaging/messaging.module';
import { AgentModule } from './agent/agent.module';
import { ApiModule } from './api/api.module';
import { ToolsModule } from './tools/tools.module';
import { VectorSearchModule } from './vector-search/vector-search.module';
import azureOpenaiConfig from './config/azure-openai.config';
import qdrantConfig from './config/qdrant.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [azureOpenaiConfig, qdrantConfig],
    }),
    MessagingModule,
    ToolsModule,
    VectorSearchModule,
    AgentModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
