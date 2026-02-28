import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TicketDto {
  @ApiProperty({ description: 'Unique thread identifier for conversation tracking' })
  @IsString()
  @IsNotEmpty()
  threadId: string;

  @ApiProperty({ description: 'The support ticket text or query to analyze' })
  @IsString()
  @IsNotEmpty()
  ticketText: string;

  @ApiPropertyOptional({ description: 'Optional requester identifier' })
  @IsString()
  @IsOptional()
  requesterId?: string;
}
