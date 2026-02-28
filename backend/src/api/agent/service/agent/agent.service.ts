import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SseMessage } from '../../dto/sse.dto';
import { MessageDto, SseMessageDto } from '../../dto/message.dto';
import { MessageUtil } from '../../utils/message.util';
import { IAgentService } from '../iagent.service';
import { ReactAgent } from 'src/agent/implementations/react.agent';
import { MessageResponseDto } from '../../dto/message.response.dto';
import { RedisService } from 'src/messaging/redis/redis.service';
import { TicketDto } from '../../dto/ticket.dto';
import { TicketAnalysisResponseDto } from '../../dto/ticket-response.dto';

@Injectable()
export class AgentService implements IAgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private agent: ReactAgent,
    private redisService: RedisService,
  ) {}

  async analyzeTicket(ticketDto: TicketDto): Promise<TicketAnalysisResponseDto> {
    const startTime = Date.now();
    const config = {
      configurable: { thread_id: ticketDto.threadId },
    };

    try {
      const message = await this.agent.chat(
        {
          messages: [
            new HumanMessage(
              `Analyze this support ticket and provide recommendations: ${ticketDto.ticketText}`,
            ),
          ],
        },
        config,
      );

      const rawContent =
        typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content);

      const parsed = this.parseAgentResponse(rawContent);
      const processingTime = Date.now() - startTime;

      return {
        threadId: ticketDto.threadId,
        classification: parsed.classification,
        metadata: parsed.metadata,
        knowledge_articles: parsed.knowledge_articles,
        historical_tickets: parsed.historical_tickets,
        recommendations: parsed.recommendations,
        tools_used: parsed.tools_used || [],
        complexity_assessment: parsed.complexity_assessment || 'unknown',
        raw_response: rawContent,
        processing_time_ms: processingTime,
      };
    } catch (error) {
      this.logger.error('Error analyzing ticket', error);
      throw new BadRequestException(
        error.message || 'An error occurred while analyzing the ticket.',
      );
    }
  }

  async chat(messageDto: MessageDto): Promise<MessageResponseDto> {
    const messages = MessageUtil.toHumanMessages(messageDto);
    const config = {
      configurable: { thread_id: messageDto.threadId },
    };
    try {
      const message = await this.agent.chat(
        {
          messages,
        },
        config,
      );
      return {
        id: message.id || 'unknown',
        type: message.getType() as 'human' | 'ai' | 'tool',
        content: message.content,
      };
    } catch (error) {
      this.logger.error('Error in chat:', error);
      throw new BadRequestException(
        error.message || 'An error occurred while processing your request.',
      );
    }
  }

  async stream(message: SseMessageDto): Promise<Observable<SseMessage>> {
    const channel = `agent-stream:${message.threadId}`;
    this.logger.log(`Streaming messages to channel: ${channel}`);

    this.streamMessagesToRedis(
      [new HumanMessage(message.content)],
      { configurable: { thread_id: message.threadId } },
      channel,
    );

    return this.redisService
      .subscribe(channel)
      .pipe(map((msg) => JSON.parse(msg) as SseMessage));
  }

  private async streamMessagesToRedis(
    messages: BaseMessage[],
    configurable: Record<string, any>,
    channel: string,
  ) {
    try {
      const streams = await this.agent.stream(
        { messages },
        {
          streamMode: 'messages',
          ...configurable,
        },
      );

      for await (const chunk of streams) {
        if (!chunk) continue;

        const messageChunks = Array.isArray(chunk)
          ? chunk.filter((item) => item?.constructor?.name === 'AIMessageChunk')
          : [];

        for (const messageChunk of messageChunks) {
          await this.redisService.publish(
            channel,
            JSON.stringify({
              data: {
                id: messageChunk.id,
                type: messageChunk.getType() as 'human' | 'ai' | 'tool',
                content: messageChunk.content,
              },
              type: 'message',
            }),
          );
        }
      }

      await this.redisService.publish(
        channel,
        JSON.stringify({ data: { id: 'done', content: '' }, type: 'done' }),
      );
    } catch (error) {
      this.logger.error('Error in streamMessagesToRedis:', error);
      await this.redisService.publish(
        channel,
        JSON.stringify({ type: 'error', data: { message: error.message } }),
      );
    }
  }

  async getHistory(threadId: string): Promise<MessageResponseDto[]> {
    try {
      const history = await this.agent.getHistory(threadId);
      return history
        .map((msg: BaseMessage) => ({
          id: msg.id || 'unknown',
          type: msg.getType() as 'human' | 'ai' | 'tool',
          content: msg.content,
        }))
        .filter((msg) => msg.content);
    } catch (error) {
      this.logger.error('Error fetching history:', error);
      throw new BadRequestException(
        error.message || 'An error occurred while fetching history.',
      );
    }
  }

  private parseAgentResponse(rawContent: string): any {
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      this.logger.warn('Could not parse structured JSON from agent response');
    }

    return {
      classification: null,
      metadata: null,
      knowledge_articles: [],
      historical_tickets: [],
      recommendations: {
        summary: rawContent,
        immediate_actions: [],
        resolution_steps: [],
        estimated_resolution_time: 'unknown',
        escalation_needed: false,
      },
      tools_used: [],
      complexity_assessment: 'unknown',
    };
  }
}
