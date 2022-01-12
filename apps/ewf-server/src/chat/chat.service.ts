import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Message, User } from 'interfaces';
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

  getUsers() {
    return this.serialiseUsersToJSON();
  }

  publishMessage(msg: string) {
    return this.client.emit('messages', msg);
  }

  publishUsers() {
    return this.client.emit('users', this.serialiseUsersToJSON());
  }

  private serialiseUsersToJSON() {
    const arr = Array.from(this.users).map(([k, v]) => v);
    console.log(arr);
    return arr;
  }
}
