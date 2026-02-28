import { Module } from '@nestjs/common';
import { ReactAgent } from './implementations/react.agent';
import { ToolsModule } from '../tools/tools.module';
import { VectorSearchModule } from '../vector-search/vector-search.module';

@Module({
  imports: [ToolsModule, VectorSearchModule],
  providers: [ReactAgent],
  exports: [ReactAgent],
})
export class AgentModule {}
