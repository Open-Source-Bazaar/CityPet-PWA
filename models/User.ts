import { User, UserCredential, WebAuthnChallenge } from '@idea2app/data-server';
import { clear } from 'idb-keyval';
import { HTTPClient } from 'koajax';
import { observable, reaction } from 'mobx';
import { persist, restore, toggle } from 'mobx-restful';
import { setCookie } from 'web-utility';

import { TableModel } from './Base';
import { API_Host, isServer } from './configuration';

/**
 * MobX model managing user authentication, sessions, and WebAuthn operations.
 */
export class UserModel extends TableModel<User> {
  baseURI = 'user';

  @persist()
  @observable
  accessor session: User | undefined;

  disposer = reaction(
    () => this.session?.token,
    token => setCookie('token', token || '', { path: '/' }),
  );

  restored = !isServer() && restore(this, 'User');

  client = new HTTPClient({
    baseURI: process.env.NEXT_PUBLIC_API_HOST || `${API_Host}/api/`,
    responseType: 'json',
  }).use(async ({ request }, next) => {
    await this.restored;

    const host = process.env.NEXT_PUBLIC_API_HOST || `${API_Host}/api/`;
    const isSameDomain = host.startsWith(new URL(request.path, host).origin);

    if (isSameDomain && this.session?.token)
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${this.session.token}`,
      };

    return next();
  });

  /**
   * Sends a one-time verification password (OTP) to the given email address.
   *
   * @param address - Recipient email address.
   */
  @toggle('uploading')
  async sendOTP(address: string) {
    await this.client.post(
      `user/session/email/${encodeURIComponent(address)}/OTP`,
    );
  }

  /**
   * Signs up a new user using email and password credentials.
   *
   * @param email - User email address.
   * @param password - User password.
   * @returns Created user data.
   */
  @toggle('uploading')
  async signUp(email: string, password: string) {
    const { body } = await this.client.post<User>('user', { email, password });

    return body;
  }

  /**
   * Signs in an existing user using email and password credentials.
   *
   * @param email - User email address.
   * @param password - User password.
   * @returns Active session user.
   */
  @toggle('uploading')
  async signIn(email: string, password: string) {
    const { body } = await this.client.post<User>('user/session', {
      email,
      password,
    });

    return (this.session = body);
  }

  /**
   * Creates or retrieves a WebAuthn challenge from the server.
   *
   * @returns Challenge string.
   */
  @toggle('uploading')
  async createChallenge() {
    const { body } = await this.client.post<WebAuthnChallenge>(
      'user/WebAuthn/challenge',
    );

    return body!.string;
  }

  /**
   * Registers a new WebAuthn credential for the specified email.
   *
   * @param email - User email address.
   * @returns Registered user credential.
   */
  @toggle('uploading')
  async signUpWebAuthn(email: string) {
    if (isServer()) throw new Error('WebAuthn not available on server side');

    const { client } = await import('@passwordless-id/webauthn');
    const challenge = await this.createChallenge();
    const registration = await client.register({ user: email, challenge });

    const { body } = await this.client.post<UserCredential>(
      'user/WebAuthn/registration',
      {
        ...registration,
        challenge,
      },
    );

    return body!;
  }

  /**
   * Authenticates a user using WebAuthn passkey or hardware security key.
   *
   * @returns Active session user.
   */
  @toggle('uploading')
  async signInWebAuthn() {
    if (isServer()) throw new Error('WebAuthn not available on server side');

    const { client } = await import('@passwordless-id/webauthn');
    const challenge = await this.createChallenge();
    const authentication = await client.authenticate({ challenge });

    const { body } = await this.client.post<User>(
      'user/WebAuthn/authentication',
      {
        ...authentication,
        challenge,
      },
    );

    return (this.session = body);
  }

  /**
   * Clears stored credentials and terminates active session.
   */
  @toggle('uploading')
  async signOut() {
    await clear();
    this.session = undefined;
    location.hash = '';
  }
}

export default new UserModel();
