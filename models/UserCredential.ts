import { UserCredential } from '@idea2app/data-server';
import { toggle } from 'mobx-restful';

import { TableModel } from './Base';
import userStore from './User';

/**
 * MobX model managing WebAuthn credentials for authenticated sessions.
 */
export class UserCredentialModel extends TableModel<UserCredential> {
  baseURI = 'user/WebAuthn/session/credential';

  client = userStore.client;

  /**
   * Registers and binds a new WebAuthn credential for the specified email.
   *
   * @param email - User email address.
   * @returns Registered credential.
   */
  async createOne(email: string) {
    const credential = await userStore.signUpWebAuthn(email);

    this.restoreList({ allItems: [credential, ...this.allItems] });

    return credential;
  }

  /**
   * Deletes a registered WebAuthn credential by ID.
   *
   * @param id - Credential identifier.
   */
  @toggle('uploading')
  async deleteOne(id: string | number) {
    const { uuid = '' } =
      this.currentOne.id === id
        ? this.currentOne
        : this.allItems.find(item => item.id === id) || {};

    await super.deleteOne(id);

    const credentialHelper = PublicKeyCredential as unknown as {
      signalUnknownCredential?: (options: {
        rpId: string;
        credentialId: string;
      }) => Promise<void>;
    };

    await credentialHelper.signalUnknownCredential?.({
      rpId: location.hostname,
      credentialId: uuid,
    });
  }
}

export default new UserCredentialModel();
