import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { natsConfig } from './nats.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, natsConfig);
  await app.listen();
}
bootstrap();
