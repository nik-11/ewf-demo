import { Message } from 'interfaces';
import { FunctionComponent } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { nuid } from '../pages/App';
import { DateTime } from 'luxon';

interface ThreadMessageProps {
  message: Message;
}

const other = {
  alignSelf: 'start',
  maxWidth: '60%',
  background: 'white',
};

const self = {
  alignSelf: 'end',
  maxWidth: '60%',
  background: 'purple.300',
  color: 'white',
};

const ThreadMessage: FunctionComponent<ThreadMessageProps> = ({ message }) => {
  const isAuthor = nuid === message?.author?.id;
  return (
    <Flex w="100%" direction="column">
      <Box
        pt={!isAuthor ? 2 : 1}
        pb="1"
        pl="3"
        pr="6"
        borderRadius="4"
        sx={isAuthor ? self : other}
      >
        {!isAuthor && (
          <Text
            fontSize="xs"
            mb={1}
            sx={{ lineHeight: '0.5rem', fontWeight: 600 }}
          >
            {message?.author?.name}
          </Text>
        )}
        <Text>{message?.message}</Text>
        <Text fontSize="10px">
          {DateTime.fromMillis(parseInt(message.timestamp)).toLocaleString(
            DateTime.TIME_SIMPLE
          )}
        </Text>
      </Box>
    </Flex>
  );
};

export default ThreadMessage;
