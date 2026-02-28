import { Module } from '@nestjs/common';
import { ClassificationService } from './classification/classification.service';
import { ExtractionService } from './extraction/extraction.service';
import { HistoricalService } from './historical/historical.service';

@Module({
  providers: [ClassificationService, ExtractionService, HistoricalService],
  exports: [ClassificationService, ExtractionService, HistoricalService],
})
export class ToolsModule {}
