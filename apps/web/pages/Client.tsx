import { FunctionComponent, useState, useEffect } from 'react';
import {
  JSONCodec,
  connect,
  NatsConnection,
  MsgHdrsImpl,
  Nuid,
  MsgHdrs,
} from 'nats.ws';
import { Message, User } from 'interfaces';
import OnlineUsers from './OnlineUsers';

const jc = JSONCodec();

interface ClientProps {}

export const nuid = new Nuid().next();
export const publishEvent = (
  connection: NatsConnection,
  subject: string,
  data: any
) => {
  const headers = new MsgHdrsImpl();
  headers.append('id', nuid);
  headers.append('unix_time', Date.now().toString());
  connection.publish(subject, jc.encode(data), { headers });
};

const Client: FunctionComponent<ClientProps> = () => {
  const [nc, setConnection] = useState<NatsConnection>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const listenForChanges = async (subscription) => {
    for await (const m of subscription) {
      const { data, pattern }: any = jc.decode(m.data);
      switch (pattern) {
        case 'users':
          setUsers(data);
          break;
        case 'messages':
          setMessages((messages) => [...messages, data]);
          break;
        default:
          break;
      }
      console.log(
        `[${subscription.getProcessed()}]: ${JSON.stringify({ data, pattern })}`
      );
    }
    console.log('subscription closed');
  };

  useEffect(() => {
    console.log('Mounting component');
    let c;
    if (!nc) {
      connect({ servers: ['ws://localhost:443'], user: nuid })
        .then((connection) => {
          c = connection;
          console.log('connected!', c);
          setConnection(c);
          publishEvent(c, 'connect', { message: 'hi!' });
        })
        .catch((err) => console.log(err));
    }

    return () => {
      console.log('Unmounting component');
      publishEvent(c, 'disconnect', { message: 'hi!' });
      c.drain();
    };
  }, []);

  useEffect(() => {
    console.log('nc useEffect');
    if (nc) {
      const messages = nc.subscribe('messages');
      listenForChanges(messages);
      const users = nc.subscribe('users');
      listenForChanges(users);
    }
  }, [nc]);

  const sendMessage = (event) => {
    if (event.key === 'Enter') {
      publishEvent(nc, 'message', { message: event.target.value });
    }
  };

  return (
    <div>
      <h2>Client</h2>
      <OnlineUsers users={users} />
      <div>
        <h3>Messages</h3>
        <div>{messages.length}</div>
        {messages?.length > 0 && (
          <div>
            {messages.map(({ message }, index) => (
              <div key={`message${index}`}>{message}</div>
            ))}
          </div>
        )}
      </div>
      <input type="text" onKeyDown={sendMessage} />
    </div>
  );
};

export default Client;
