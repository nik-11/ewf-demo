import { FunctionComponent, useState, useEffect } from 'react';
import { JSONCodec, connect, NatsConnection, MsgHdrsImpl, Nuid } from 'nats.ws';
import { User, Channel } from 'interfaces';
import {
  Text,
  Flex,
  Box,
  Center,
  Button,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import Thread from '../components/Thread';
import SidePanel from '../components/SidePanel';
import NewThreadModal from '../components/NewThreadModal';
import uniq from 'lodash.uniq';
import { DateTime } from 'luxon';
import ScrollToBottom from 'react-scroll-to-bottom';
import { css } from '@emotion/css';

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
  headers.append('unix_time', DateTime.now().toISO());
  connection.publish(subject, jc.encode(data), { headers });
};

const itemHover = {
  backgroundColor: 'rgba(0,0,0,0.08)',
  color: 'purple.500',
  cursor: 'pointer',
};

const SCROLL_CSS = css({ height: 'calc(100% - 50px)', paddingBottom: '60px' });

const Client: FunctionComponent<ClientProps> = ({ disconnectFn }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [nc, setConnection] = useState<NatsConnection>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<User>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  const listenForChanges = async (subscription) => {
    setSubscriptions((subscriptions: string[]) => {
      if (!subscriptions.some((subject) => subject === subscription.subject)) {
        return [subscription.subject, ...subscriptions];
      } else {
        return subscriptions;
      }
    });
    for await (const m of subscription) {
      const { data, pattern }: any = jc.decode(m.data);
      switch (pattern) {
        case 'users':
          setUsers(data);
          if (!me) {
            setMe(data.find(({ id }) => id === nuid));
          }
          break;
        case `${nuid}.channels`:
          setChannels((channels) => uniq([...channels, data.channel]));
          break;
        default:
          break;
      }
    }
    console.log('subscription closed');
  };

  const listenForChannelMessages = async (subscription) => {
    setSubscriptions((subscriptions: string[]) => {
      if (!subscriptions.some((subject) => subject === subscription.subject)) {
        return [subscription.subject, ...subscriptions];
      } else {
        return subscriptions;
      }
    });
    for await (const m of subscription) {
      const { data, pattern }: any = jc.decode(m.data);
      const subject = pattern.substring(0, pattern.length - 9);
      const idx = channels.findIndex((channel) => channel.subject === subject);
      if (idx !== -1) {
        const channel = channels[idx];
        channel.lastMessage = data.message;
        channel.messages.push(data.message);
        channel.messages.sort((a, b) => {
          if (a.timestamp > b.timestamp) return 1;
          if (a.timestamp < b.timestamp) return -1;
          return 0;
        });
        setChannels((c) => {
          return uniq([channel, ...c]);
        });
      }
    }
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
    if (nc && !nc.isDraining()) {
      const users = nc.subscribe('users');
      listenForChanges(users);
      const channels = nc.subscribe(`${nuid}.channels`);
      listenForChanges(channels);
    }
  }, [nc]);

  useEffect(() => {
    if (nc && !nc.isDraining() && channels.length > 0) {
      for (const channel of channels) {
        if (selectedChannel && selectedChannel.subject === channel.subject) {
          setSelectedChannel(channel);
        }
        const subscription = `${channel.subject}.messages`;
        if (!subscriptions.some((subject) => subject === subscription)) {
          const messages = nc.subscribe(subscription);
          listenForChannelMessages(messages);
        }
      }
    }
  }, [channels]);

  const sendMessage = (event) => {
    if (event.key === 'Enter') {
      publishEvent(nc, 'message', {
        subject: selectedChannel.subject,
        message: event.target.value,
      });
      event.target.value = '';
    }
  };

  const createNewThread = (users) => {
    users.push(me);
    users.sort((a, b) => {
      if (a.id > b.id) return 1;
      if (a.id < b.id) return -1;
      return 0;
    });
    const ids: string[] = users.map(({ id }) => id);
    const subject = ids.join('.');
    const channel = channels.find((channel) => channel.subject === subject);

    if (!channel) {
      const newChannel: Channel = {
        subject,
        createdBy: me,
        users,
        messages: [],
      };
      publishEvent(nc, 'create_channel', {
        subject,
        users: ids,
      });
      setSelectedChannel(newChannel);
    } else {
      setSelectedChannel(channel);
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
            <Button size="sm" colorScheme="purple" onClick={onOpen}>
              New Thread
            </Button>
          }
          listItems={channels.map((channel, index) => {
            const isSelected = channel.subject === selectedChannel?.subject;
            return (
              <Box
                py="2"
                px="4"
                w="100%"
                _hover={itemHover}
                key={`user${index}`}
                onClick={() => setSelectedChannel(channel)}
              >
                <Text
                  fontWeight={isSelected ? 700 : 400}
                  fontSize="lg"
                  isTruncated
                >
                  {channel.users.map(({ name }) => name).join(', ')}
                </Text>
                {channel.lastMessage ? (
                  <Text fontSize="sm" isTruncated>
                    {DateTime.fromMillis(
                      parseInt(channel.lastMessage.timestamp)
                    ).toLocaleString(DateTime.TIME_SIMPLE)}{' '}
                    {channel.lastMessage.message}
                  </Text>
                ) : (
                  <Text fontSize="sm">No messages</Text>
                )}
              </Box>
            );
          })}
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
        <ScrollToBottom className={SCROLL_CSS}>
          <Thread thread={selectedChannel} />
        </ScrollToBottom>
        <Box
          bg="transparent"
          px="4"
          py="2"
          w="100%"
          position="absolute"
          bottom="0"
        >
          {!!selectedChannel && (
            <Input
              bg="white"
              placeholder="Message"
              variant="filled"
              _focus={{ backgroundColor: 'white' }}
              onKeyPress={sendMessage}
            />
          )}
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
              _hover={id === nuid ? {} : itemHover}
              key={`user${index}`}
              onClick={() =>
                id === nuid ? undefined : createNewThread([{ id, name }])
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
      <NewThreadModal
        isOpen={isOpen}
        onClose={onClose}
        users={users?.length > 0 ? users.filter(({ id }) => id !== nuid) : []}
        emitSelectedUsers={createNewThread}
      />
    </Flex>
  );
};

export default Client;
