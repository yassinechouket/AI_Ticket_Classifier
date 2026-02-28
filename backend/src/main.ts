import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Ticket Classifier')
    .setDescription('Adaptive AI agent for IT support ticket analysis')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
