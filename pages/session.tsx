import { observer } from 'mobx-react';
import { FC, useContext } from 'react';
import { Card, Container } from 'react-bootstrap';

import { PageHead } from '../components/Layout/PageHead';
import { SessionForm } from '../components/User/SessionForm';
import { CredentialList } from '../components/User/WebAuthn';
import { I18nContext } from '../models/Translation';
import userStore from '../models/User';

/**
 * Dedicated session page rendering login form or WebAuthn credentials when authenticated.
 */
const SessionPage: FC = observer(() => {
  const { t } = useContext(I18nContext);
  const currentUser = userStore.session;

  return (
    <Container style={{ maxWidth: 480 }}>
      <PageHead title={t('session')} />

      <h1 className="my-4 text-center">{t('session')}</h1>

      <Card body className="shadow-sm">
        {currentUser ? (
          <CredentialList email={currentUser.email!} />
        ) : (
          <SessionForm />
        )}
      </Card>
    </Container>
  );
});

export default SessionPage;
