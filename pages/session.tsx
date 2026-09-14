import { observer } from 'mobx-react';
import { FC, useContext } from 'react';
import { Card, Container } from 'react-bootstrap';

import { PageHead } from '../components/Layout/PageHead';
import { SessionForm } from '../components/User/SessionForm';
import { I18nContext } from '../models/Translation';

const SessionPage: FC = observer(() => {
  const { t } = useContext(I18nContext);

  return (
    <Container style={{ maxWidth: 480 }}>
      <PageHead title={t('session')} />

      <h1 className="my-4 text-center">{t('session')}</h1>

      <Card body className="shadow-sm">
        <SessionForm />
      </Card>
    </Container>
  );
});
export default SessionPage;
