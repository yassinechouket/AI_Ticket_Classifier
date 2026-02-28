import { Observable } from 'rxjs';
import { MessageDto, SseMessageDto } from '../dto/message.dto';
import { SseMessage } from '../dto/sse.dto';
import { MessageResponseDto } from '../dto/message.response.dto';
import { TicketDto } from '../dto/ticket.dto';
import { TicketAnalysisResponseDto } from '../dto/ticket-response.dto';

export interface IAgentService {
  analyzeTicket(ticket: TicketDto): Promise<TicketAnalysisResponseDto>;
  chat(message: MessageDto): Promise<any>;
  stream(message: SseMessageDto): Promise<Observable<SseMessage>>;
  getHistory(threadId: string): Promise<MessageResponseDto[]>;
}
