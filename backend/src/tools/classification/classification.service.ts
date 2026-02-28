import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private readonly llm: AzureChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    this.llm = new AzureChatOpenAI({
      azureOpenAIApiKey: this.configService.get<string>(
        'AZURE_OPENAI_API_KEY',
      ),
      azureOpenAIApiInstanceName: this.extractInstanceName(
        this.configService.get<string>('AZURE_OPENAI_ENDPOINT') || '',
      ),
      azureOpenAIApiDeploymentName: this.configService.get<string>(
        'AZURE_OPENAI_DEPLOYMENT_NAME',
      ),
      azureOpenAIApiVersion: this.configService.get<string>(
        'AZURE_OPENAI_API_VERSION',
      ),
      temperature: 0,
      maxTokens: 1000,
    });
  }

  async classify(ticketText: string): Promise<string> {
    const prompt = `Classify the following IT support ticket. Return ONLY valid JSON with these fields:
- category: one of [Hardware, Software, Network, Security, Database, Cloud, Access Management, Email, Monitoring, Service Request]
- priority: one of [P1-Critical, P2-High, P3-Medium, P4-Low]
- assigned_team: one of [Infrastructure, Applications, Security, End User Support, IAM, Database, Cloud, Network, Email]
- confidence: a number between 0.0 and 1.0

Ticket: ${ticketText}`;

    try {
      const response = await this.llm.invoke(prompt);
      return typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);
    } catch (error) {
      this.logger.error('Classification failed', error);
      return JSON.stringify({
        error: 'Classification failed',
        category: 'Unknown',
        priority: 'P3-Medium',
        assigned_team: 'End User Support',
        confidence: 0,
      });
    }
  }

  private extractInstanceName(endpoint: string): string {
    const match = endpoint.match(/https:\/\/([^.]+)\.openai\.azure\.com/);
    return match ? match[1] : endpoint;
  }
}
