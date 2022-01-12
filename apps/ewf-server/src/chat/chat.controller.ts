import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @EventPattern('connect')
  connect(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.connectUser(headers.get('id'));
    }
  }

  @EventPattern('disconnect')
  disconnect(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.disconnectUser(headers.get('id'));
    }
  }
}
