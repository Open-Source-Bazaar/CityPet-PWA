import { useContext } from 'react';
import { Container } from 'react-bootstrap';

import { PageHead } from '../components/Layout/PageHead';
import { SessionForm } from '../components/User/SessionForm';
import { I18nContext } from '../models/Translation';

export default function SessionPage() {
  const { t } = useContext(I18nContext);

  return (
    <Container as="main">
      <PageHead title={t('session')} />
      <SessionForm />
    </Container>
  );
}
