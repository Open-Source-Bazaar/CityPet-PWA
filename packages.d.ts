declare module '*.less' {
  const map: Record<string, string>;

  export default map;
}

declare module '@editorjs/*' {
  const Plugin: import('@editorjs/editorjs').ToolConstructable;

  export default Plugin;
}

declare module '@idea2app/data-server' {
  import { IDType } from 'mobx-restful';

  export interface Base {
    id?: IDType;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface ListChunk<D> {
    list: D[];
    count: number;
  }

  export interface User extends Base {
    email?: string;
    token?: string;
    name?: string;
    avatar?: string;
    [key: string]: unknown;
  }

  export interface AuthenticatorMetadata {
    name?: string;
    icon_light?: string;
    icon_dark?: string;
  }

  export interface UserCredential extends Base {
    id: IDType;
    uuid: string;
    algorithm?: string;
    transports?: string[];
    synced?: boolean;
    userVerified?: boolean;
    authenticator?: AuthenticatorMetadata;
  }

  export interface WebAuthnChallenge {
    string: string;
  }

  export interface SignInData {
    email: string;
    password?: string;
    code?: string;
  }
}
