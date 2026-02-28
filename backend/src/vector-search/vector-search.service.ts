import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { AzureOpenAIEmbeddings } from '@langchain/openai';

export interface SearchResult {
  docId: string;
  docType: string;
  title: string;
  content: string;
  score: number;
}

@Injectable()
export class VectorSearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VectorSearchService.name);
  private client: QdrantClient;
  private embeddings: AzureOpenAIEmbeddings;
  private readonly collectionName: string;
  private readonly vectorSize = 1536;

  constructor(private readonly configService: ConfigService) {
    this.collectionName =
      this.configService.get<string>('QDRANT_COLLECTION') || 'knowledge_base';

    this.client = new QdrantClient({
      host: this.configService.get<string>('QDRANT_HOST') || 'localhost',
      port: this.configService.get<number>('QDRANT_PORT') || 6333,
      checkCompatibility: false,
    });

    this.embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: this.configService.get<string>(
        'AZURE_OPENAI_API_KEY',
      ),
      azureOpenAIApiInstanceName: this.extractInstanceName(
        this.configService.get<string>('AZURE_OPENAI_ENDPOINT') || '',
      ),
      azureOpenAIApiDeploymentName: this.configService.get<string>(
        'AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME',
      ),
      azureOpenAIApiVersion: this.configService.get<string>(
        'AZURE_OPENAI_API_VERSION',
      ),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureCollection();
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Vector search service shutting down');
  }

  async ensureCollection(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        this.logger.log(`Created collection: ${this.collectionName}`);
      }
    } catch (error) {
      this.logger.warn(
        'Could not connect to Qdrant. Vector search will be unavailable.',
        error,
      );
    }
  }

  async upsertDocuments(
    documents: {
      id: string;
      docType: string;
      title: string;
      content: string;
    }[],
  ): Promise<void> {
    const contents = documents.map((d) => d.content);
    const vectors = await this.embeddings.embedDocuments(contents);

    const points = documents.map((doc, index) => ({
      id: this.hashToNumber(doc.id),
      vector: vectors[index],
      payload: {
        doc_id: doc.id,
        doc_type: doc.docType,
        title: doc.title,
        content: doc.content,
      },
    }));

    await this.client.upsert(this.collectionName, {
      wait: true,
      points,
    });

    this.logger.log(`Upserted ${documents.length} documents`);
  }

  async search(query: string, topK: number = 3): Promise<SearchResult[]> {
    try {
      const queryVector = await this.embeddings.embedQuery(query);

      const results = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit: topK,
        with_payload: true,
      });

      return results.map((r) => ({
        docId: (r.payload?.doc_id as string) || '',
        docType: (r.payload?.doc_type as string) || '',
        title: (r.payload?.title as string) || '',
        content: ((r.payload?.content as string) || '').substring(0, 500),
        score: r.score,
      }));
    } catch (error) {
      this.logger.error('Vector search failed', error);
      return [];
    }
  }

  async getCollectionInfo(): Promise<any> {
    try {
      return await this.client.getCollection(this.collectionName);
    } catch {
      return null;
    }
  }

  private hashToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private extractInstanceName(endpoint: string): string {
    const match = endpoint.match(/https:\/\/([^.]+)\.openai\.azure\.com/);
    return match ? match[1] : endpoint;
  }
}
