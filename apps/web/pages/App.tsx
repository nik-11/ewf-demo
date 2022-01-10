import { useState, useEffect } from 'react';
import { connect, StringCodec } from 'nats.ws';

const sc = StringCodec();

const App = () => {
  const [nc, setConnection] = useState(undefined);

  useEffect(() => {
    if (!nc) {
      connect({ servers: ['ws://127.0.0.1:4222'] })
        .then((connection) => setConnection(connection))
        .catch((err) => console.error(err));
    }
  });

  return <div className="App">Testing</div>;
};

export default App;
