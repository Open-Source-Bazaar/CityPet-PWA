import type { SignInWithOtpRes } from '@cloudbase/js-sdk/auth';
import { action, computed, observable, observableRef } from 'mobx';
import { BaseModel, toggle } from 'mobx-restful';
import Router from 'next/router';

import { getCloudBaseClient } from '../components/User/CloudBase';
import { ownClient } from './Base';
import { SessionPayload } from './Session';

export type AuthChannel = 'email' | 'phone';

type VerifyOtp = NonNullable<SignInWithOtpRes['data']['verifyOtp']>;

export class AuthModel extends BaseModel {
  client = ownClient;

  @observable
  accessor identity: SessionPayload | undefined;

  @observable
  accessor account = '';

  @observable
  accessor token = '';

  @observable
  accessor errorKey:
    'auth_missing_verifier' | 'auth_missing_session' | undefined;

  @observableRef
  accessor verifyOtp: VerifyOtp | undefined;

  @computed
  get user() {
    return this.identity?.user;
  }

  @computed
  get userName() {
    const { user } = this;

    return user?.name || user?.email || user?.phone || user?.id || '';
  }

  @computed
  get status(): 'checking' | 'signedOut' | 'signedIn' {
    if (this.identity) return 'signedIn';

    return this.downloading > 0 ? 'checking' : 'signedOut';
  }

  @action
  acceptPayload(payload?: SessionPayload) {
    this.identity = payload;
  }

  @action
  @toggle('downloading')
  async loadSession() {
    const { body } = await this.client.get<SessionPayload | null>(
      'user/session',
    );

    if (body === undefined)
      throw new Error('Server session lookup returned no data');

    this.acceptPayload(body || undefined);
  }

  @action
  @toggle('downloading')
  async refreshIdentity() {
    const { body } = await this.client.put<SessionPayload>('user/session');

    if (!body) throw new Error('Server session refresh returned no data');

    this.acceptPayload(body);
  }

  @action
  setAccount(account: string) {
    this.account = account;
  }

  @action
  setToken(token: string) {
    this.token = token;
  }

  @action
  resetCode() {
    this.verifyOtp = undefined;
    this.token = '';
    this.errorKey = undefined;
  }

  @action
  @toggle('uploading')
  async sendOTP(channel: AuthChannel) {
    const account = this.account.trim();

    this.resetCode();
    const { data, error } = await getCloudBaseClient()
      .auth()
      .signInWithOtp(
        channel === 'email' ? { email: account } : { phone: account },
      );

    if (error) throw error;
    if (!data.verifyOtp) {
      this.errorKey = 'auth_missing_verifier';

      return;
    }
    this.verifyOtp = data.verifyOtp;
  }

  @action
  @toggle('uploading')
  async signIn() {
    this.errorKey = undefined;

    if (!this.verifyOtp) {
      this.errorKey = 'auth_missing_verifier';

      return;
    }
    const { error } = await this.verifyOtp({ token: this.token.trim() });

    if (error) throw error;

    const { accessToken } = await getCloudBaseClient().auth().getAccessToken();

    if (!accessToken) {
      this.errorKey = 'auth_missing_session';

      return;
    }
    const { body } = await this.client.post<SessionPayload>('user/session', {
      accessToken,
    });

    if (!body) throw new Error('Server sign-in returned no data');

    this.acceptPayload(body);
    this.resetCode();
    Router.reload();
  }

  @action
  @toggle('uploading')
  async signOut() {
    const result = await getCloudBaseClient().auth().signOut();

    if (result && 'error' in result && result.error) throw result.error;

    await this.client.delete('user/session');

    this.acceptPayload();
    this.resetCode();
    this.account = '';
    Router.reload();
  }
}

export const authStore = new AuthModel();
