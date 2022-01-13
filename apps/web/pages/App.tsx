import Client from './Client';
import { useState } from 'react';
import { Button, Box, Center } from '@chakra-ui/react';

const App = () => {
  const [showClient, setShowClient] = useState<boolean>(false);

  const handleClick = () => {
    setShowClient(!showClient);
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw' }}>
      {!showClient && (
        <Center h="100%">
          <Button size="lg" onClick={handleClick}>
            Connect to Chat
          </Button>
        </Center>
      )}
      {showClient && <Client disconnectFn={handleClick} />}
    </Box>
  );
};

export default App;
