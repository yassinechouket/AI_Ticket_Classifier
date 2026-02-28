import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClassificationService } from './classification.service';

describe('ClassificationService', () => {
  let service: ClassificationService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          AZURE_OPENAI_API_KEY: 'test-key',
          AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com',
          AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4o',
          AZURE_OPENAI_API_VERSION: '2024-08-01-preview',
        };
        return config[key];
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassificationService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ClassificationService>(ClassificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return fallback JSON on classification failure', async () => {
    jest.spyOn(service['llm'], 'invoke').mockRejectedValue(new Error('API failure'));

    const result = await service.classify('test ticket');
    const parsed = JSON.parse(result);

    expect(parsed.error).toBe('Classification failed');
    expect(parsed.category).toBe('Unknown');
    expect(parsed.priority).toBe('P3-Medium');
    expect(parsed.assigned_team).toBe('End User Support');
    expect(parsed.confidence).toBe(0);
  });

  it('should return string content from successful classification', async () => {
    const mockResult = JSON.stringify({
      category: 'Software',
      priority: 'P2-High',
      assigned_team: 'Applications',
      confidence: 0.85,
    });

    jest.spyOn(service['llm'], 'invoke').mockResolvedValue({
      content: mockResult,
    } as any);

    const result = await service.classify('Application crashing on startup');
    const parsed = JSON.parse(result);

    expect(parsed.category).toBe('Software');
    expect(parsed.priority).toBe('P2-High');
    expect(parsed.assigned_team).toBe('Applications');
    expect(parsed.confidence).toBe(0.85);
  });
});
