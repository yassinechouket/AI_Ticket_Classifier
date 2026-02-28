import { Module } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { KnowledgeLoaderService } from './knowledge-loader.service';

@Module({
  providers: [VectorSearchService, KnowledgeLoaderService],
  exports: [VectorSearchService, KnowledgeLoaderService],
})
export class VectorSearchModule {}
