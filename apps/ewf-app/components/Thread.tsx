import { Channel } from 'interfaces';
import { FunctionComponent } from 'react';
import { VStack, Text } from '@chakra-ui/react';
import ThreadMessage from './ThreadMessage';

interface ThreadProps {
  thread: Channel;
}

const Thread: FunctionComponent<ThreadProps> = ({ thread }) => {
  return (
    <VStack p="4" h="100%">
      {thread?.messages.length > 0 ? (
        thread.messages.map((message, index) => (
          <ThreadMessage key={`message${index}`} message={message} />
        ))
      ) : (
        <Text>No messages here</Text>
      )}
    </VStack>
  );
};

export default Thread;
