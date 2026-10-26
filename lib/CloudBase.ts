import { HTTPClient } from 'koajax';

import { CloudBaseEnv } from '../models/configuration';

export interface CloudBaseUser {
  sub?: string;
  user_id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  picture?: string;
}

export const cloudbaseAPI = new HTTPClient({
  baseURI: `https://${CloudBaseEnv}.api.tcloudbasegateway.com/`,
  responseType: 'json',
});

export async function getCloudBaseUser(token: string) {
  if (!CloudBaseEnv) throw new Error('NEXT_PUBLIC_CLOUDBASE_ENV is required');

  const { body } = await cloudbaseAPI.get<CloudBaseUser>('auth/v1/user/me', {
    Authorization: `Bearer ${token}`,
  });

  if (!body || !(body.sub || body.user_id))
    throw new Error('CloudBase did not return a valid user');

  return body;
}
