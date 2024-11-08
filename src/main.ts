import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerSetup } from './swagger-setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

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

  // Enable CORS to allow any domain
  app.enableCors({
    origin: '*', // Allows any origin to access the API
    credentials: true,
  });

  SwaggerSetup(app, configService);

  await app.listen(port);
}

bootstrap();
