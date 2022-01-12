import { FunctionComponent, useState, useEffect } from 'react';
import {
  JSONCodec,
  connect,
  NatsConnection,
  MsgHdrsImpl,
  Nuid,
  MsgHdrs,
} from 'nats.ws';

const jc = JSONCodec();

interface ClientProps {}

const Client: FunctionComponent<ClientProps> = () => {
  const [nc, setConnection] = useState<NatsConnection>(null);
  const [id] = useState<string>(new Nuid().next());

  const logResponse = async (data) => {
    for await (const m of data) {
      console.log(
        `[${data.getProcessed()}]: ${JSON.stringify(jc.decode(m.data))}`
      );
    }
    console.log('subscription closed');
  };

  const publishHeaders = (): MsgHdrs => {
    const headers = new MsgHdrsImpl();
    headers.append('id', id);
    headers.append('unix_time', Date.now().toString());
    return headers;
  };

  useEffect(() => {
    let c;
    if (!nc) {
      const headers = publishHeaders();
      connect({ servers: ['ws://localhost:443'], user: id })
        .then((connection) => {
          c = connection;
          console.log('connected!', c);
          setConnection(c);
          connection.publish('connect', jc.encode({ message: 'hi!' }), {
            headers,
          });
        })
        .catch((err) => console.log(err));
    }

    return () => {
      console.log('Unmounting component');

      const headers = publishHeaders();
      c.publish('disconnect', jc.encode({ message: 'bye!' }), { headers });
      c.drain();
    };
  }, []);

  useEffect(() => {
    if (nc) {
      const messages = nc.subscribe('message');
      logResponse(messages);
      const users = nc.subscribe('users');
      logResponse(users);
    }
  }, [nc]);

  return <div>Client works!</div>;
};

export default Client;
