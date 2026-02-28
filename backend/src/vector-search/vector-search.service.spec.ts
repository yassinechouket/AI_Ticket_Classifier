import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VectorSearchService } from './vector-search.service';

describe('VectorSearchService', () => {
  let service: VectorSearchService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          QDRANT_HOST: 'localhost',
          QDRANT_PORT: 6333,
          QDRANT_COLLECTION: 'test_knowledge_base',
          AZURE_OPENAI_API_KEY: 'test-key',
          AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com',
          AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME: 'text-embedding-ada-002',
          AZURE_OPENAI_API_VERSION: '2024-08-01-preview',
        };
        return config[key];
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorSearchService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VectorSearchService>(VectorSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array when search fails', async () => {
    jest.spyOn(service['embeddings'], 'embedQuery').mockRejectedValue(
      new Error('Embedding failed'),
    );

    const results = await service.search('test query');
    expect(results).toEqual([]);
  });

  it('should return null when collection info is unavailable', async () => {
    jest.spyOn(service['client'], 'getCollection').mockRejectedValue(
      new Error('Not found'),
    );

    const info = await service.getCollectionInfo();
    expect(info).toBeNull();
  });
});
