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

  // TODO: match subject in EventPattern, and inject from context.getSubject()
  @EventPattern('message')
  sendMessage(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.publishMessageToChannel(
        data.subject,
        headers.get('id'),
        data.message
      );
    }
  }

  @EventPattern('create_channel')
  createChannel(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.createChannel(
        data.subject,
        headers.get('id'),
        data.users
      );
    }
  }

  @EventPattern('join_channel')
  fetchChannel(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.joinChannel(data.subject, headers.get('id'));
    }
  }

  @EventPattern('delete_channel')
  deleteChannel(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.deleteChannel(data.subject, headers.get('id'));
    }
  }
}
