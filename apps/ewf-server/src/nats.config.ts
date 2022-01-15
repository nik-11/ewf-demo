import { NatsTransportStrategy } from '@alexy4744/nestjs-nats-jetstream-transporter';
import { DeliverPolicy, StreamConfig } from 'nats';

type NatsStreamConfig = Partial<StreamConfig> & Pick<StreamConfig, 'name'>;
export const natsConfig = {
  strategy: new NatsTransportStrategy({
    streams: <NatsStreamConfig[]>[
      {
        name: 'user-events',
        subjects: [
          'user.connected',
          'user.disconnected',
          'users.online',
          '*.channels',
        ],
        deliver_policy: DeliverPolicy.LastPerSubject,
      },
      {
        name: 'channel-events',
        subjects: [
          'channel.messages.>',
          'channel.created',
          'channel.deleted',
          'channel.joined',
        ],
      },
    ],
  }),
};
