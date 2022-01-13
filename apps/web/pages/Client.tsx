import { FunctionComponent, useState, useEffect } from 'react';
import { JSONCodec, connect, NatsConnection, MsgHdrsImpl, Nuid } from 'nats.ws';
import { Message, User } from 'interfaces';
import {
  Text,
  Flex,
  Box,
  Center,
  Heading,
  VStack,
  Divider,
  Spacer,
  Button,
  Input,
} from '@chakra-ui/react';
import OnlineUsers from './OnlineUsers';
import Channel from './Channel';
import SidePanel from './SidePanel';

interface ClientProps {
  disconnectFn: () => void;
}

const jc = JSONCodec();
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

const Client: FunctionComponent<ClientProps> = ({ disconnectFn }) => {
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
          setConnection(c);
          publishEvent(c, 'connect', { message: 'hi!' });
        })
        .catch((err) => console.log(err));
    }

    return () => {
      console.log('Unmounting component');
      publishEvent(c, 'disconnect', { message: 'bye!' });
      c.drain();
    };
  }, []);

  useEffect(() => {
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
    <Flex h="100%">
      <Box
        minWidth="250px"
        maxWidth="500px"
        flex="1"
        borderRightColor="gray.300"
        borderRightWidth="1px"
      >
        <SidePanel
          heading="Threads"
          headingButton={
            <Button
              size="sm"
              colorScheme="purple"
              onClick={() => console.log('new thread!')}
            >
              New Thread
            </Button>
          }
          listItems={[]}
          emptyListMessage="No threads. Start writing some messages!"
        />
      </Box>
      <Box flex="1" bg="gray.100" overflow="hidden" position="relative">
        <Center
          bg="white"
          px="4"
          py="2"
          borderBottom="1px"
          borderBottomColor="gray.300"
          h="50px"
        >
          <Text fontSize="xl">Messages</Text>
        </Center>
        <Box overflowY="scroll" h="calc(100% - 50px)" paddingBottom="50px">
          <Channel></Channel>
        </Box>
        <Box
          bg="transparent"
          px="4"
          py="2"
          w="100%"
          position="absolute"
          bottom="0"
        >
          <Input bg="white" placeholder="Message" variant="filled" />
        </Box>
      </Box>
      <Box
        minWidth="300px"
        maxWidth="350px"
        flex="1"
        borderLeftWidth="1px"
        borderLeftColor="gray.300"
      >
        <SidePanel
          heading={`Online Users: ${users?.length ?? 0}`}
          headingButton={
            <Button size="sm" colorScheme="red" onClick={disconnectFn}>
              Disconnect
            </Button>
          }
          listItems={users.map(({ id, name }, index) => (
            <Center
              h="40px"
              w="100%"
              _hover={
                id === nuid
                  ? {}
                  : {
                      background: 'white',
                      color: 'purple.500',
                      cursor: 'pointer',
                    }
              }
              key={`user${index}`}
              onClick={() =>
                id === nuid ? undefined : console.log({ id, name })
              }
            >
              <Flex fontSize="md">
                <Text>{name}</Text>
                {id === nuid && <Text>&nbsp;(you)</Text>}
              </Flex>
            </Center>
          ))}
          emptyListMessage="No users are online."
        />
      </Box>
      {/* <Text fontSize="xl" sx={{ fontWeight: 'bold' }}>
        Client
      </Text>
      <OnlineUsers users={users} />
      <div>
        <Channel />
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
      <input type="text" onKeyDown={sendMessage} /> */}
    </Flex>
  );
};

export default Client;
