import { Message } from './message';
import { User } from './user';

export interface Channel {
  subject: string;
  createdBy: User;
  users: User[];
  messages: Message[];
  lastMessage?: Message;
}
