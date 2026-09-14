import { HTTPClient } from 'koajax';
import { observable } from 'mobx';
import { persist, restore, toggle } from 'mobx-restful';

import { API_Host, isServer } from './configuration';

export interface SessionUser {
  id?: string | number;
  email?: string;
  token?: string;
  [key: string]: unknown;
}

interface WebAuthnChallenge {
  string: string;
}

export class UserModel {
  @persist()
  @observable
  accessor session: SessionUser | undefined;

  @observable
  accessor uploading = 0;

  restored = !isServer() && restore(this, 'User');

  client = new HTTPClient({
    baseURI: process.env.NEXT_PUBLIC_API_HOST || `${API_Host}/api/`,
    responseType: 'json',
  }).use(async ({ request }, next) => {
    await this.restored;

    if (this.session?.token)
      request.headers = {
        ...request.headers,
        Authorization: String(this.session.token),
      };

    return next();
  });

  @toggle('uploading')
  async sendOTP(address: string) {
    await this.client.post(`user/session/email/${encodeURIComponent(address)}/OTP`);
  }

  @toggle('uploading')
  async signUp(email: string, password: string) {
    const { body } = await this.client.post<SessionUser>('user', { email, password });

    return body;
  }

  @toggle('uploading')
  async signIn(email: string, password: string) {
    const { body } = await this.client.post<SessionUser>('user/session', {
      email,
      password,
    });

    return (this.session = body);
  }

  @toggle('uploading')
  async createChallenge() {
    const { body } = await this.client
      .get<WebAuthnChallenge>('user/WebAuthn/challenge')
      .catch(() => this.client.post<WebAuthnChallenge>('user/WebAuthn/challenge'));

    return body?.string || '';
  }

  @toggle('uploading')
  async signInWebAuthn() {
    if (isServer()) throw new Error('WebAuthn not available on server side');

    const { client } = await import('@passwordless-id/webauthn');
    const challenge = await this.createChallenge();

    const authentication = await client.authenticate({ challenge });
    const { body } = await this.client.post<SessionUser>('user/WebAuthn/authentication', {
      ...authentication,
      challenge,
    });

    return (this.session = body);
  }
}

export default new UserModel();
