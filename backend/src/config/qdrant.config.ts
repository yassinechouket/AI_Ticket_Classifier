import { registerAs } from '@nestjs/config';

export default registerAs('qdrant', () => ({
  host: process.env.QDRANT_HOST || 'localhost',
  port: parseInt(process.env.QDRANT_PORT || '6333', 10),
  collectionName: process.env.QDRANT_COLLECTION || 'knowledge_base',
}));
