import { Module } from '@nestjs/common';
import { AgentController } from './agent/controller/agent.controller';
import { AgentService } from './agent/service/agent/agent.service';
import { AgentModule } from 'src/agent/agent.module';
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  imports: [AgentModule, MessagingModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class ApiModule {}
