import { observer } from 'mobx-react';
import { compose, errorLogger, jwtVerifier } from 'next-ssr-middleware';
import { useContext } from 'react';
import { Button, Card, Container } from 'react-bootstrap';

import { PageHead } from '../../../components/Layout/PageHead';
import { AuthGuard } from '../../../components/User/AuthGuard';
import { withSession } from '../../../lib/SSR';
import { authStore } from '../../../models/Auth';
import { SessionProps } from '../../../models/Session';
import { I18nContext } from '../../../models/Translation';

export const getServerSideProps = compose(
  errorLogger,
  withSession,
  jwtVerifier('token', 'JWT_SECRET', { algorithms: ['HS256'] }),
);

const UserDetailPage = observer(({ jwtPayload }: SessionProps) => {
  const { t } = useContext(I18nContext);
  const user = jwtPayload?.user;

  return (
    <>
      <PageHead title={t(user ? 'user_details' : 'auth_submit')} />
      <AuthGuard jwtPayload={jwtPayload}>
        <Container as="main" className="py-4" style={{ maxWidth: 640 }}>
          <h1 className="text-center mb-4">{t('user_details')}</h1>
          <Card body className="shadow">
            <dl>
              {(
                [
                  ['user_display_name', user?.name],
                  ['user_id', user?.id],
                  ['auth_email', user?.email],
                  ['auth_phone', user?.phone],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="mb-3">
                  <dt>{t(label)}</dt>
                  <dd className="text-break">
                    {value?.trim() || t('user_not_provided')}
                  </dd>
                </div>
              ))}
            </dl>
            <Button
              variant="outline-danger"
              disabled={authStore.uploading > 0}
              onClick={() => authStore.signOut()}
            >
              {t('auth_sign_out')}
            </Button>
          </Card>
        </Container>
      </AuthGuard>
    </>
  );
});

export default UserDetailPage;
