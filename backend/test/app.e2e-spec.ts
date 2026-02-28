import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

describe('Agent API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { AppModule } = jest.requireActual('./../src/app.module');

    jest.mock('./../src/agent/implementations/react.agent', () => ({
      ReactAgent: jest.fn().mockImplementation(() => ({
        chat: jest.fn().mockResolvedValue({
          content: JSON.stringify({
            classification: {
              category: 'Software',
              priority: 'P3-Medium',
              assigned_team: 'Applications',
              confidence: 0.8,
            },
            tools_used: ['classify_ticket'],
            complexity_assessment: 'simple',
          }),
          id: 'test-msg',
          getType: () => 'ai',
        }),
        stream: jest.fn(),
        getHistory: jest.fn().mockResolvedValue([]),
        initCheckpointer: jest.fn(),
      })),
    }));

    jest.mock('./../src/vector-search/vector-search.service', () => ({
      VectorSearchService: jest.fn().mockImplementation(() => ({
        ensureCollection: jest.fn(),
        search: jest.fn().mockResolvedValue([]),
        upsertDocuments: jest.fn(),
        getCollectionInfo: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })),
    }));

    jest.mock('./../src/vector-search/knowledge-loader.service', () => ({
      KnowledgeLoaderService: jest.fn().mockImplementation(() => ({
        loadKnowledgeBase: jest.fn().mockResolvedValue(0),
        onModuleInit: jest.fn(),
      })),
    }));

    jest.mock('./../src/messaging/redis/redis.service', () => ({
      RedisService: jest.fn().mockImplementation(() => ({
        publish: jest.fn(),
        subscribe: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })),
    }));

    jest.mock('./../src/agent/memory/memory', () => ({
      createPostgresMemory: jest.fn().mockReturnValue({
        setup: jest.fn(),
        get: jest.fn(),
      }),
      postgresCheckpointer: {
        setup: jest.fn(),
        get: jest.fn(),
      },
    }));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    jest.restoreAllMocks();
  });

  it('GET /api/agent/history/:threadId should return history', () => {
    return request(app.getHttpServer() as App)
      .get('/api/agent/history/test-thread')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
