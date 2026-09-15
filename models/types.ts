import type {
  AuthenticatorInfo,
  ExtendedAuthenticatorTransport,
  NamedAlgo,
} from '@passwordless-id/webauthn';

/**
 * Minimal subset of `@idea2app/data-server` type definitions,
 * which is published on GitHub Packages and requires authorization to install.
 * @see https://github.com/idea2app/REST-Node-ts/tree/master/source/model
 */

export interface Base {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ListChunk<T> {
  count: number;
  list: T[];
}

export interface SignInData {
  email: string;
  password: string;
}

export interface WebAuthnChallenge {
  string: string;
}

export type CredentialAlgorithm = NamedAlgo;

export interface UserCredential extends Base {
  uuid: string;
  publicKey: string;
  algorithm: CredentialAlgorithm;
  transports: ExtendedAuthenticatorTransport[];
  authenticator: AuthenticatorInfo;
  synced: boolean;
  userVerified: boolean;
}

export interface User extends Base {
  name: string;
  avatar?: string;
  email?: string;
  mobilePhone?: string;
  roles?: number[];
  token?: string;
}
