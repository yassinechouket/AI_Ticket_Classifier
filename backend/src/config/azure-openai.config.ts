import { registerAs } from '@nestjs/config';

export default registerAs('azureOpenai', () => ({
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
  embeddingDeploymentName:
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME ||
    'text-embedding-ada-002',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
}));
