import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SwaggerSetup } from './swagger-setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const { port, global_prefix } = configService.get('APP');

  app.setGlobalPrefix(global_prefix);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
    }),
  );

  const corsOptions = {
    origin: 'https://edu-manager-sass.netlify.app',
    // origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'x-client-key',
      'x-client-token',
      'x-client-secret',
      'Authorization',
    ],
    credentials: true,
  };
  // Enable CORS to allow any domain
  app.enableCors(corsOptions);

  SwaggerSetup(app, configService);

  // Add a default route handler for the root URL
  app.getHttpAdapter().get('/', (req, res: Response) => {
    res.json({ message: 'Welcome to the API!' });
  });

  await app.listen(port);
}

bootstrap();
