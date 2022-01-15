import { NatsClient } from '@alexy4744/nestjs-nats-jetstream-transporter';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Channel, Message, User } from 'interfaces';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

@Injectable()
export class ChatService {
  users: Map<string, User> = new Map();
  messages: Map<string, Message[]> = new Map();
  channels: Map<string, Channel> = new Map();

  constructor() {}

  connectUser(id: string) {
    const user = this.users.get(id);
    if (!user) {
      this.users.set(id, {
        id,
        name: uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          separator: '-',
        }),
        online: true,
      });
    } else {
      this.users.set(id, { ...user, online: true });
    }
    const users = this.serialiseUsersToJSON().filter((user) => user.online);
    const channels = this.serialiseChannelsToJSON()
      .map((channel) =>
        channel.users.some((user) => user.id === id) ? channel : null
      )
      .filter((channel) => !!channel);
    console.log(channels);
    return { users, channels };
  }

  disconnectUser(id: string) {
    const user = this.users.get(id);
    if (id) {
      this.users.set(id, { ...user, online: false });
      return this.serialiseUsersToJSON().filter((user) => user.online);
    }
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
      return { subject, message };
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
      return channel;
    }
  }

  joinChannel(subject: string, userId: string) {
    const channel = this.channels.get(subject);
    // Check user can access the channel
    if (channel && channel.users.some(({ id }) => id === userId)) {
      // this.client.emit(subject, { channel });
    } else {
      // this.client.emit(subject, { message: 'Unauthorized' });
    }
  }

  deleteChannel(subject: string, userId: string) {
    const channel = this.channels.get(subject);
    // Check user is creator of channel
    if (channel && channel.createdBy.id === userId) {
      this.channels.delete(subject);
      // this.client.emit(subject, { message: 'Deleted' });
    }
  }

  private serialiseUsersToJSON() {
    return Array.from(this.users).map(([k, v]) => v);
  }

  private serialiseChannelsToJSON() {
    return Array.from(this.channels).map(([k, v]) => v);
  }
}
