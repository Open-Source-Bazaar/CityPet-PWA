import { User } from '@idea2app/data-server';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { JWTProps } from 'next-ssr-middleware';
import { Component, PropsWithChildren } from 'react';
import { Modal } from 'react-bootstrap';

import userStore from '../../models/User';
import { SessionForm } from './SessionForm';
import { CredentialList } from './WebAuthn';

export interface SessionBoxProps extends PropsWithChildren<JWTProps<User>> {
  path?: string;
}

/**
 * Modal dialog displaying the authentication form or WebAuthn credential management.
 */
@observer
export class SessionBox extends Component<SessionBoxProps> {
  @observable
  accessor modalShown = false;

  componentDidMount() {
    this.modalShown = !this.props.jwtPayload;
  }

  /**
   * Toggles visibility of the authentication dialog.
   *
   * @param open - Target open state.
   */
  toggleModal = (open: boolean) => {
    if (open || this.props.jwtPayload || userStore.session)
      this.modalShown = open;
  };

  render() {
    const { children, jwtPayload } = this.props,
      currentUser = userStore.session || jwtPayload;

    return (
      <>
        {children}

        <Modal
          centered
          backdrop={currentUser ? true : 'static'}
          keyboard={!!currentUser}
          show={this.modalShown}
          onHide={() => this.toggleModal(false)}
        >
          <Modal.Header closeButton={!!currentUser}>
            <Modal.Title>{currentUser ? currentUser.email : ''}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentUser ? (
              <CredentialList email={currentUser.email!} />
            ) : (
              <SessionForm onSignIn={() => (this.modalShown = true)} />
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
