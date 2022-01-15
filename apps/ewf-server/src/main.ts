import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { natsConfig } from './nats.config';

/**
 * Bootstraps the Nest server and instantiates a connection to the NATS server microservice.
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, natsConfig);
  await app.listen();
}
bootstrap();
