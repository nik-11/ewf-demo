import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Channel, Message, User } from 'interfaces';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

@Injectable()
export class ChatService implements OnApplicationBootstrap {
  numOfUsers: number = 0;
  users: Map<string, User> = new Map();
  messages: Map<string, Message[]> = new Map();
  channels: Map<string, Channel> = new Map();

  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) {}

  async onApplicationBootstrap() {
    this.client.connect().then((value) => console.log(value));
  }

  connectUser(id: string) {
    if (!this.users.has(id)) {
      this.users.set(id, {
        id,
        name: uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          separator: '-',
        }),
      });
      this.numOfUsers++;
      this.publishUsers();
    }
  }

  disconnectUser(id: string) {
    if (this.users.has(id)) {
      this.users.delete(id);
      this.numOfUsers--;
      this.publishUsers();
    }
  }

  publishUsers() {
    return this.client.emit('users', this.serialiseUsersToJSON());
  }

  publishMessageToChannel(subject: string, userId: string, msg: string) {
    const channel = this.channels.get(subject);
    if (channel) {
      const timestamp = Date.now();
      const message: Message = {
        author: this.users.get(userId),
        message: msg,
        timestamp: timestamp.toString(),
      };
      const lastMessageTimestamp = channel.lastMessage
        ? new Date(channel.lastMessage.timestamp)
        : null;
      if (!lastMessageTimestamp || lastMessageTimestamp.getTime() < timestamp) {
        channel.lastMessage = message;
      }
      channel.messages.push(message);
      this.channels.set(subject, channel);
      this.client.emit(`${subject}.messages`, { message });
    }
  }

  createChannel(subject: string, userId: string, channelUsers: string[]) {
    if (!this.channels.has(subject)) {
      const createdBy = this.users.get(userId);
      const users = channelUsers.map((id: string) => this.users.get(id));
      const channel = {
        subject,
        createdBy,
        users,
        messages: [],
      };
      this.channels.set(subject, channel);
      for (const user of users) {
        this.client.emit(`${user.id}.channels`, { channel });
      }
    }
  }

  joinChannel(subject: string, userId: string) {
    const channel = this.channels.get(subject);
    // Check user can access the channel
    if (channel && channel.users.some(({ id }) => id === userId)) {
      this.client.emit(subject, { channel });
    } else {
      this.client.emit(subject, { message: 'Unauthorized' });
    }
  }

  deleteChannel(subject: string, userId: string) {
    const channel = this.channels.get(subject);
    // Check user is creator of channel
    if (channel && channel.createdBy.id === userId) {
      this.channels.delete(subject);
      this.client.emit(subject, { message: 'Deleted' });
    }
  }

  private serialiseUsersToJSON() {
    const arr = Array.from(this.users).map(([k, v]) => v);
    console.log(arr);
    return arr;
  }
}
