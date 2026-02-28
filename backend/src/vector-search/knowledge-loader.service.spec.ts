import { KnowledgeLoaderService } from './knowledge-loader.service';
import { VectorSearchService } from './vector-search.service';
import * as fs from 'fs';

jest.mock('fs');

describe('KnowledgeLoaderService', () => {
  let service: KnowledgeLoaderService;
  let mockVectorSearchService: jest.Mocked<VectorSearchService>;

  const FAKE_KB_PATH = '/fake/knowledge_base';

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(['doc1.txt']);
    (fs.readFileSync as jest.Mock).mockReturnValue('Sample document content for testing purposes. This covers database troubleshooting.');

    mockVectorSearchService = {
      getCollectionInfo: jest.fn(),
      upsertDocuments: jest.fn().mockResolvedValue(undefined),
      search: jest.fn(),
      ensureCollection: jest.fn(),
    } as any;

    service = new KnowledgeLoaderService(mockVectorSearchService);
    (service as any).knowledgeBasePath = FAKE_KB_PATH;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should skip loading if collection already populated', async () => {
    mockVectorSearchService.getCollectionInfo.mockResolvedValue({
      points_count: 100,
    });

    const count = await service.loadKnowledgeBase();
    expect(count).toBe(100);
    expect(mockVectorSearchService.upsertDocuments).not.toHaveBeenCalled();
  });

  it('should load documents when collection is empty', async () => {
    mockVectorSearchService.getCollectionInfo.mockResolvedValue({
      points_count: 0,
    });
    mockVectorSearchService.upsertDocuments.mockResolvedValue(undefined);

    const count = await service.loadKnowledgeBase();
    expect(count).toBeGreaterThan(0);
    expect(mockVectorSearchService.upsertDocuments).toHaveBeenCalled();
  });

  it('should handle missing knowledge base directory', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const customService = new KnowledgeLoaderService(mockVectorSearchService);
    (customService as any).knowledgeBasePath = '/nonexistent/path';

    const count = await customService.loadKnowledgeBase();
    expect(count).toBe(0);
  });
});
