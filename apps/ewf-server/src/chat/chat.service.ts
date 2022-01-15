import { Injectable } from '@nestjs/common';
import { Channel, Message, User } from 'interfaces';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

@Injectable()
export class ChatService {
  users: Map<string, User> = new Map(); // In memory store for all Users
  channels: Map<string, Channel> = new Map(); // In memory stored for all Channels

  constructor() {}

  /**
   * Connects a user to the application and emits any related channels to the connecting user.
   * @param id
   * @returns
   */
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

  /**
   * Disconnects a user from the application
   * @param id
   * @returns
   */
  disconnectUser(id: string) {
    const user = this.users.get(id);
    if (id) {
      this.users.set(id, { ...user, online: false });
      return this.serialiseUsersToJSON().filter((user) => user.online);
    }
  }

  /**
   * Publishes a message to a given channel, and updates the last message if possible
   * @param subject
   * @param userId
   * @param msg
   * @returns
   */
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

  /**
   * Creates a channel, stored as a subject of the user's IDs joined with '.'
   * @param subject
   * @param userId
   * @param channelUsers
   * @returns
   */
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

  /**
   * Serialises the Users Map to an Array of Users
   * @returns
   */
  private serialiseUsersToJSON() {
    return Array.from(this.users).map(([k, v]) => v);
  }

  /**
   * Serialises the Channels Map to an Array of Users
   * @returns
   */
  private serialiseChannelsToJSON() {
    return Array.from(this.channels).map(([k, v]) => v);
  }
}
