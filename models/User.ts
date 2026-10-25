import Cloudbase from '@cloudbase/js-sdk';

import { CloudBaseEnv } from './configuration';

let auth: ReturnType<ReturnType<typeof Cloudbase.init>['auth']>;

export function getUserAuth() {
  if (!CloudBaseEnv)
    throw new Error('CloudBase environment ID is not configured.');

  return (auth ??= Cloudbase.init({
    env: CloudBaseEnv,
    region: 'ap-shanghai',
  }).auth());
}
