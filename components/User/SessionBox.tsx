import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Component, PropsWithChildren } from 'react';
import { Modal } from 'react-bootstrap';

import userStore from '../../models/User';
import { SessionForm } from './SessionForm';

export interface SessionBoxProps extends PropsWithChildren {
  path?: string;
}

@observer
export class SessionBox extends Component<SessionBoxProps> {
  @observable
  accessor modalShown = false;

  componentDidMount() {
    this.modalShown = !userStore.session;
  }

  toggleModal = (open: boolean) => {
    if (open || userStore.session) this.modalShown = open;
  };

  render() {
    const currentUser = userStore.session;

    return (
      <>
        {this.props.children}

        <Modal
          centered
          show={this.modalShown}
          keyboard={!!currentUser}
          backdrop={currentUser ? true : 'static'}
          onHide={() => this.toggleModal(false)}
        >
          <Modal.Body>
            <SessionForm onSignIn={() => this.toggleModal(false)} />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
