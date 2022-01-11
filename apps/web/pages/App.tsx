import { useState, useEffect } from 'react';
import { JSONCodec, connect, NatsConnection } from 'nats.ws';

const jc = JSONCodec();

const App = () => {
  const [nc, setConnection] = useState<NatsConnection>(null);

  const logMessages = async (messages) => {
    for await (const m of messages) {
      console.log(
        `[${messages.getProcessed()}]: ${JSON.stringify(jc.decode(m.data))}`
      );
    }
    console.log('subscription closed');
  };

  useEffect(() => {
    if (!nc) {
      connect({ servers: ['ws://localhost:443'], user: 'bob' })
        .then((connection) => {
          console.log('connected!', connection);
          setConnection(connection);
        })
        .catch((err) => console.log(err));
    }
  });

  useEffect(() => {
    if (nc) {
      nc.publish('connect', jc.encode({ message: 'hi!' }));
      const messages = nc.subscribe('message');
      logMessages(messages);
    }
  }, [nc]);

  return <div className="App">Testing</div>;
};

export default App;
