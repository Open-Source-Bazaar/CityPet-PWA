import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { JWTProps } from 'next-ssr-middleware';
import { Component, PropsWithChildren } from 'react';
import { Modal } from 'react-bootstrap';

import { User } from '../../models/types';
import userStore from '../../models/User';
import { SessionForm } from './SessionForm';
import { CredentialList } from './WebAuthn';

export interface SessionBoxProps extends PropsWithChildren<JWTProps<User>> {
  path?: string;
}

@observer
export class SessionBox extends Component<SessionBoxProps> {
  @observable
  accessor modalShown = false;

  componentDidMount() {
    this.modalShown = !this.props.jwtPayload;
  }

  toggleModal = (open: boolean) => {
    if (open || userStore.session || this.props.jwtPayload)
      this.modalShown = open;
  };

  render() {
    const { children, jwtPayload } = this.props,
      currentUser = userStore.session || jwtPayload;

    return (
      <>
        {children}

        <Modal
          show={this.modalShown}
          centered
          onHide={() => this.toggleModal(false)}
        >
          {currentUser && (
            <Modal.Header closeButton className="border-0 pb-0" />
          )}

          <Modal.Body className="p-4 pt-3">
            {currentUser ? (
              <CredentialList email={currentUser.email!} />
            ) : (
              <SessionForm />
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
