import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { natsConfig } from './nats.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.connectMicroservice(natsConfig);
  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
