import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Message, User } from 'interfaces';

@Injectable()
export class ChatService implements OnApplicationBootstrap {
  numOfUsers: number = 0;
  users: Map<string, User> = new Map();

  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) {}

  async onApplicationBootstrap() {
    this.client.connect().then((value) => console.log(value));
  }

  connectUser(socket: Socket) {
    if (!this.users.has(socket.id)) {
      this.numOfUsers++;
      this.users.set(socket.id, { name: `user${this.numOfUsers}` });
      this.publishUsers();
    }
  }

  disconnectUser(socket: Socket) {
    if (this.users.has(socket.id)) {
      this.users.delete(socket.id);
      this.publishUsers();
    }
  }

  getUsers() {
    return this.serialiseUsersToJSON();
  }

  getUserFromSocket(socket: Socket) {
    const user = socket.handshake.headers.userId as string;
    if (!user) {
      throw new WsException('No userId provided');
    }
    return user;
  }

  publishMessage(msg: string) {
    return this.client.emit('message', msg);
  }

  publishUsers() {
    return this.client.emit('users', this.serialiseUsersToJSON());
  }

  async saveMessage(msg: Message) {
    return msg;
  }

  async getMessages() {}

  private serialiseUsersToJSON() {
    const arr = Array.from(this.users).reduce((obj, [k, v]) => {
      obj[k] = v;
      return obj;
    }, {});
    console.log(arr);
    return arr;
  }
}
