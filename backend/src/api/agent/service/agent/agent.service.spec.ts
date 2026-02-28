import { Test } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { BadRequestException } from '@nestjs/common';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
} from '@langchain/core/messages';
import { firstValueFrom, of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { ReactAgent } from 'src/agent/implementations/react.agent';
import { MessageContentDto } from 'src/api/agent/dto/message.dto';
import { RedisService } from 'src/messaging/redis/redis.service';

jest.mock('src/agent/implementations/react.agent');

describe('AgentService', () => {
  let service: AgentService;
  let mockReactAgent: jest.Mocked<ReactAgent>;
  let mockRedisService: jest.Mocked<RedisService>;

  const messageDto = {
    threadId: 'threadId-12345678',
    content: [
      {
        type: 'text',
        text: 'Can you summarize in two paragraphs the history of Cameroon?',
      } as MessageContentDto,
    ],
    type: 'human' as const,
  };

  const sseMessageDto = {
    threadId: 'threadId-12345678',
    content: 'Can you summarize in two paragraphs the history of Cameroon?',
    type: 'human' as const,
  };

  beforeEach(async () => {
    mockReactAgent = {
      chat: jest.fn(),
      stream: jest.fn(),
      getHistory: jest.fn(),
    } as any;

    (ReactAgent as jest.Mock).mockImplementation(() => mockReactAgent);

    mockRedisService = {
      subscribe: jest.fn().mockReturnValue(
        of(
          JSON.stringify({
            data: { id: 'test-id', type: 'ai', content: 'Test chunk' },
            type: 'message',
          }),
          JSON.stringify({ data: { id: 'done', content: '' }, type: 'done' }),
        ),
      ),
      publish: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: ReactAgent,
          useValue: mockReactAgent,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  describe('analyzeTicket', () => {
    it('should return structured analysis for a ticket', async () => {
      const jsonResponse = JSON.stringify({
        classification: {
          category: 'Infrastructure',
          priority: 'P1-Critical',
          assigned_team: 'Database',
          confidence: 0.95,
        },
        metadata: {
          priority_score: 0.95,
          urgency_level: 'Critical',
          affected_systems: ['Production DB'],
          technical_keywords: ['database', 'outage'],
          user_impact: 'Organization',
          requires_escalation: true,
        },
        knowledge_articles: [],
        historical_tickets: [],
        recommendations: {
          summary: 'Critical database outage',
          immediate_actions: ['Check connectivity'],
          resolution_steps: ['Restart service'],
          estimated_resolution_time: '2 hours',
          escalation_needed: true,
        },
        tools_used: ['classify_ticket', 'extract_metadata', 'search_knowledge'],
        complexity_assessment: 'complex',
      });

      mockReactAgent.chat.mockResolvedValue({
        content: jsonResponse,
        id: 'response-id',
        getType: () => 'ai',
      });

      const result = await service.analyzeTicket({
        threadId: 'thread-1',
        ticketText: 'Production database is down',
      });

      expect(result.threadId).toBe('thread-1');
      expect(result.classification?.category).toBe('Infrastructure');
      expect(result.classification?.priority).toBe('P1-Critical');
      expect(result.tools_used).toContain('classify_ticket');
      expect(result.complexity_assessment).toBe('complex');
      expect(result.processing_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-JSON agent response gracefully', async () => {
      mockReactAgent.chat.mockResolvedValue({
        content: 'This is a plain text response without JSON',
        id: 'response-id',
        getType: () => 'ai',
      });

      const result = await service.analyzeTicket({
        threadId: 'thread-2',
        ticketText: 'Simple password reset',
      });

      expect(result.threadId).toBe('thread-2');
      expect(result.recommendations?.summary).toContain('plain text');
      expect(result.complexity_assessment).toBe('unknown');
    });

    it('should throw BadRequestException on agent error', async () => {
      mockReactAgent.chat.mockRejectedValue(new Error('Agent failed'));

      await expect(
        service.analyzeTicket({
          threadId: 'thread-3',
          ticketText: 'some ticket',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('chat', () => {
    it('should successfully return chat response', async () => {
      const mockResponse = {
        content: 'Test response',
        id: 'response-id',
        getType: () => 'ai',
      };
      mockReactAgent.chat.mockResolvedValue(mockResponse);

      const result = await service.chat(messageDto);

      expect(result).toStrictEqual({
        content: mockResponse.content,
        id: mockResponse.id,
        type: 'ai',
      });
      expect(mockReactAgent.chat).toHaveBeenCalledWith(
        {
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: messageDto.content[0].text,
            }),
          ]),
        },
        expect.objectContaining({
          configurable: { thread_id: messageDto.threadId },
        }),
      );
    });

    it('should throw BadRequestException on error', async () => {
      const error = new Error('Test error');
      mockReactAgent.chat.mockRejectedValue(error);

      await expect(service.chat(messageDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('stream', () => {
    it('should successfully stream messages', async () => {
      const mockChunk = new AIMessageChunk({
        content: 'Test chunk',
        id: 'test-id',
      });

      mockReactAgent.stream.mockImplementation(() => {
        return Promise.resolve(createMockAsyncIterableStream([mockChunk]));
      });

      const observable = await service.stream(sseMessageDto);
      const results: any[] = [];

      const subscription = observable.subscribe({
        next: (value) => results.push(value),
        error: (err) => {
          throw err;
        },
      });

      const emitted = await firstValueFrom(observable.pipe(toArray()));

      expect(emitted).toEqual([
        {
          data: {
            id: 'test-id',
            type: 'ai',
            content: 'Test chunk',
          },
          type: 'message',
        },
        {
          data: { id: 'done', content: '' },
          type: 'done',
        },
      ]);
      subscription.unsubscribe();
    });

    it('should handle stream errors', async () => {
      mockRedisService.subscribe.mockReturnValueOnce(
        of(
          JSON.stringify({ type: 'error', data: { message: 'Stream error' } }),
        ),
      );

      const observable = await service.stream(sseMessageDto);
      const emitted = await firstValueFrom(observable);

      expect(emitted).toEqual({
        type: 'error',
        data: { message: 'Stream error' },
      });
    });
  });

  describe('getHistory', () => {
    it('should successfully return message history', async () => {
      const mockHistory = [
        new AIMessage({ content: 'AI response', id: 'ai-1' }),
        new HumanMessage({ content: 'Human message', id: 'human-1' }),
      ];

      mockReactAgent.getHistory.mockResolvedValue(mockHistory);

      const result = await service.getHistory('test-thread-id');

      expect(result).toEqual([
        { type: 'ai', content: 'AI response', id: 'ai-1' },
        { type: 'human', content: 'Human message', id: 'human-1' },
      ]);
      expect(mockReactAgent.getHistory).toHaveBeenCalledWith('test-thread-id');
    });

    it('should throw BadRequestException when fetching history fails', async () => {
      const error = new Error('History fetch error');
      mockReactAgent.getHistory.mockRejectedValue(error);

      await expect(service.getHistory('test-thread-id')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockReactAgent.getHistory).toHaveBeenCalledWith('test-thread-id');
    });
  });
});

function createMockAsyncIterableStream<T>(chunks: T[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) {
        yield [chunk];
      }
    },
    reader: {},
    ensureReader: () => {},
    [Symbol.asyncDispose]: () => {},
    locked: false,
    cancel: () => Promise.resolve(),
    getIterator: () => ({
      next: async () => ({ done: true, value: undefined }),
    }),
    pipeTo: () => Promise.resolve(),
    pipeThrough: () => ({}),
  } as any;
}
