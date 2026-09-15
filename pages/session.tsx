import { observer } from 'mobx-react';
import { useContext } from 'react';
import { Container } from 'react-bootstrap';

import { SessionBox } from '../components/User/SessionBox';
import { I18nContext } from '../models/Translation';

const SessionPage = observer(() => {
  const { t } = useContext(I18nContext);

  return (
    <Container className="my-4" style={{ maxWidth: '32rem' }}>
      <SessionBox>
        <h1 className="h3 mb-4">{t('session')}</h1>
      </SessionBox>
    </Container>
  );
});

export default SessionPage;
