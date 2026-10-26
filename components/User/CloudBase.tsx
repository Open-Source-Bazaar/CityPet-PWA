import cloudbase from '@cloudbase/js-sdk';
import { createContext, FC, PropsWithChildren } from 'react';

import { CloudBaseAccessKey, CloudBaseEnv } from '../../models/configuration';

let client: ReturnType<typeof cloudbase.init> | undefined;

export function getCloudBaseClient() {
  if (!CloudBaseEnv) throw new Error('NEXT_PUBLIC_CLOUDBASE_ENV is required');

  if (!client) {
    client = cloudbase.init({
      env: CloudBaseEnv,
      accessKey: CloudBaseAccessKey,
      endPointMode: 'GATEWAY',
    });

    if (typeof window !== 'undefined') {
      const { protocol, host } = window.location;

      client.registerEndPointWithKey({
        key: 'CLOUD_API',
        protocol: protocol === 'https:' ? 'https' : 'http',
        url: `//${host}/cloudbase/cloud-api/web`,
      });
      client.registerEndPointWithKey({
        key: 'GATEWAY',
        protocol: protocol === 'https:' ? 'https' : 'http',
        url: `//${host}/cloudbase/v1`,
      });
    }
  }

  return client;
}

export const CloudBaseContext = createContext(getCloudBaseClient);

export const CloudBaseProvider: FC<PropsWithChildren> = ({ children }) => (
  <CloudBaseContext.Provider value={getCloudBaseClient}>
    {children}
  </CloudBaseContext.Provider>
);
