import { NatsClient } from '@alexy4744/nestjs-nats-jetstream-transporter';
import { Controller, OnApplicationBootstrap } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';

@Controller()
export class ChatController implements OnApplicationBootstrap {
  private readonly client = new NatsClient(); // Maintains connection to the NATS server

  constructor(private readonly chatService: ChatService) {}

  /**
   * Connect to the NATS server when the application is started
   */
  async onApplicationBootstrap() {
    this.client.connect().then((value) => console.log(value));
  }

  /**
   * Subscribes to the `user.connected` subject.
   * Connects a user to the application.
   * @param data
   * @param context
   */
  @EventPattern('user.connected')
  connect(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    const userId = headers.get('id');
    if (headers && userId) {
      const { users, channels } = this.chatService.connectUser(userId);
      if (users) {
        this.client.emit('users.online', { users });
        if (channels) {
          this.client.emit(`${userId}.channels`, { channels });
        }
      }
    }
  }

  /**
   * Subscribes to the `user.disconnected` subject.
   * Disconnects a user from the application.
   * @param data
   * @param context
   */
  @EventPattern('user.disconnected')
  disconnect(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      const users = this.chatService.disconnectUser(headers.get('id'));
      if (users) {
        this.client.emit('users.online', { users });
      }
    }
  }

  /**
   * Subscribes to the any subject matching `channel.messages.>`.
   * Stores messages against the given channel and emits it to the recipients of the channel.
   * @param data
   * @param context
   */
  @EventPattern('channel.messages.>')
  sendMessage(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      const message = this.chatService.publishMessageToChannel(
        data.subject,
        headers.get('id'),
        data.message
      );
      if (message) {
        this.client.emit(`${message.subject}.messages`, {
          message: message.message,
        });
      }
    }
  }

  /**
   * Subscribes to the `channel.created` subject.
   * Allows a user to create a channel with any number of recipients, which is then emitted to each recipient.
   * @param data
   * @param context
   */
  @EventPattern('channel.created')
  createChannel(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      const channel = this.chatService.createChannel(
        data.subject,
        headers.get('id'),
        data.users
      );
      if (channel) {
        for (const user of data.users) {
          this.client.emit(`${user}.channels`, { channels: [channel] });
        }
      }
    }
  }

  // NYI
  /* @EventPattern('channel.joined')
  fetchChannel(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.joinChannel(data.subject, headers.get('id'));
    }
  } */

  // NYI
  /* @EventPattern('channel.deleted')
  deleteChannel(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(`Subject: ${context.getSubject()}`);
    console.log(`Headers: ${context.getHeaders()}`);
    const headers = context.getHeaders();
    if (headers && headers.get('id')) {
      this.chatService.deleteChannel(data.subject, headers.get('id'));
    }
  } */
}
