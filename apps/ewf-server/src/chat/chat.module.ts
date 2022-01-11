import { ClientsModule } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { natsConfig } from '../nats.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        ...natsConfig,
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
