import { randomUUID } from 'node:crypto';
import { after, mock } from 'node:test';

process.env.JWT_SECRET = randomUUID();
process.env.NEXT_PUBLIC_CLOUDBASE_ENV = 'test-env';

const channels: BroadcastChannel[] = [];
const channelMock = mock.method(
  globalThis,
  'BroadcastChannel',
  class extends BroadcastChannel {
    constructor(name: string) {
      super(name);
      channels.push(this);
    }
  },
);

after(() => {
  for (const channel of channels) channel.close();
  channelMock.mock.restore();
});
