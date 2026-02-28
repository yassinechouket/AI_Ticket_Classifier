import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import * as fs from 'fs';
import * as path from 'path';

interface DocumentChunk {
  id: string;
  docType: string;
  title: string;
  content: string;
}

@Injectable()
export class KnowledgeLoaderService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeLoaderService.name);
  private readonly knowledgeBasePath: string;

  constructor(private readonly vectorSearchService: VectorSearchService) {
    this.knowledgeBasePath = path.resolve(
      process.cwd(),
      'knowledge_base',
    );
  }

  async onModuleInit(): Promise<void> {
    await this.loadKnowledgeBase();
  }

  async loadKnowledgeBase(): Promise<number> {
    if (!fs.existsSync(this.knowledgeBasePath)) {
      this.logger.warn(
        `Knowledge base directory not found: ${this.knowledgeBasePath}`,
      );
      return 0;
    }

    const files = fs
      .readdirSync(this.knowledgeBasePath)
      .filter((f) => f.endsWith('.txt'));

    const allChunks: DocumentChunk[] = [];

    for (const file of files) {
      const filePath = path.join(this.knowledgeBasePath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const docType = this.inferDocType(file);
      const chunks = this.chunkDocument(file, docType, content);
      allChunks.push(...chunks);
    }

    if (allChunks.length === 0) {
      this.logger.warn('No document chunks found to load');
      return 0;
    }

    try {
      const collectionInfo = await this.vectorSearchService.getCollectionInfo();
      if (collectionInfo?.points_count > 0) {
        this.logger.log(
          `Collection already contains ${collectionInfo.points_count} points, skipping load`,
        );
        return collectionInfo.points_count;
      }
    } catch {
      this.logger.log('Collection info unavailable, proceeding with load');
    }

    const batchSize = 20;
    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      try {
        await this.vectorSearchService.upsertDocuments(
          batch.map((c) => ({
            id: c.id,
            docType: c.docType,
            title: c.title,
            content: c.content,
          })),
        );
      } catch (error) {
        this.logger.error(`Failed to upsert batch starting at ${i}`, error);
      }
    }

    this.logger.log(
      `Loaded ${allChunks.length} chunks from ${files.length} files`,
    );
    return allChunks.length;
  }

  private chunkDocument(
    filename: string,
    docType: string,
    content: string,
  ): DocumentChunk[] {
    const sections = content.split(/(?=={3,})/);
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    for (const section of sections) {
      const trimmed = section.trim();
      if (trimmed.length < 50) continue;

      const titleMatch = trimmed.match(/^={3,}\s*\n(.+?)(?:\n|$)/);
      const title = titleMatch
        ? titleMatch[1].trim()
        : filename.replace('.txt', '').replace(/_/g, ' ');

      const subChunks = this.splitBySize(trimmed, 800, 1500);
      for (const sub of subChunks) {
        chunks.push({
          id: `${filename}-chunk-${chunkIndex}`,
          docType,
          title,
          content: sub,
        });
        chunkIndex++;
      }
    }

    if (chunks.length === 0) {
      const subChunks = this.splitBySize(content, 800, 1500);
      subChunks.forEach((sub, idx) => {
        chunks.push({
          id: `${filename}-chunk-${idx}`,
          docType,
          title: filename.replace('.txt', '').replace(/_/g, ' '),
          content: sub,
        });
      });
    }

    return chunks;
  }

  private splitBySize(
    text: string,
    minSize: number,
    maxSize: number,
  ): string[] {
    if (text.length <= maxSize) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxSize) {
        chunks.push(remaining);
        break;
      }

      let splitPoint = remaining.lastIndexOf('\n', maxSize);
      if (splitPoint < minSize) {
        splitPoint = remaining.lastIndexOf(' ', maxSize);
      }
      if (splitPoint < minSize) {
        splitPoint = maxSize;
      }

      chunks.push(remaining.substring(0, splitPoint).trim());
      remaining = remaining.substring(splitPoint).trim();
    }

    return chunks;
  }

  private inferDocType(filename: string): string {
    const name = filename.toLowerCase();
    if (name.includes('security')) return 'security';
    if (name.includes('network')) return 'network';
    if (name.includes('infrastructure')) return 'infrastructure';
    if (name.includes('database')) return 'database';
    if (name.includes('cloud')) return 'cloud';
    if (name.includes('email')) return 'email';
    if (name.includes('monitoring')) return 'monitoring';
    if (name.includes('storage') || name.includes('backup')) return 'storage';
    if (name.includes('access') || name.includes('user')) return 'access';
    if (name.includes('slack') || name.includes('collaboration'))
      return 'collaboration';
    if (name.includes('ticket') || name.includes('classification'))
      return 'classification';
    return 'general';
  }
}
