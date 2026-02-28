import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureChatOpenAI } from '@langchain/openai';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
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
      maxTokens: 1500,
    });
  }

  async extract(ticketText: string): Promise<string> {
    const prompt = `Extract detailed metadata from the following IT support ticket. Return ONLY valid JSON with these fields:
- priority_score: number between 0.0 and 1.0 (0.9+ = Critical, 0.7-0.9 = High, 0.4-0.7 = Medium, below 0.4 = Low)
- urgency_level: one of [Critical, High, Medium, Low]
- affected_systems: array of system names affected
- technical_keywords: array of relevant technical terms
- user_impact: one of [Single User, Multiple Users, Department, Organization]
- requires_escalation: boolean

Ticket: ${ticketText}`;

    try {
      const response = await this.llm.invoke(prompt);
      return typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);
    } catch (error) {
      this.logger.error('Extraction failed', error);
      return JSON.stringify({
        error: 'Extraction failed',
        priority_score: 0.5,
        urgency_level: 'Medium',
        affected_systems: [],
        technical_keywords: [],
        user_impact: 'Single User',
        requires_escalation: false,
      });
    }
  }

  private extractInstanceName(endpoint: string): string {
    const match = endpoint.match(/https:\/\/([^.]+)\.openai\.azure\.com/);
    return match ? match[1] : endpoint;
  }
}
