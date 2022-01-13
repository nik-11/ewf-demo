import { User } from './user';

export interface Message {
  author: User;
  message: string;
  timestamp: string;
}
