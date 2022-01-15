import Client from './Client';
import { useState } from 'react';
import { Button, Box, Center } from '@chakra-ui/react';
import { Nuid } from 'nats.ws';

export const nuid = new Nuid().next();

const App = () => {
  const [showClient, setShowClient] = useState<boolean>(false);

  const handleClick = () => {
    setShowClient(!showClient);
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {!showClient && (
        <Center h="100%">
          <Button size="lg" colorScheme="purple" onClick={handleClick}>
            Connect to Chat
          </Button>
        </Center>
      )}
      {showClient && <Client disconnectFn={handleClick} />}
    </Box>
  );
};

export default App;
