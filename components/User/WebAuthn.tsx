import { observer } from 'mobx-react';
import { FC, useContext, useEffect } from 'react';
import { Button, ListGroup, Spinner } from 'react-bootstrap';

import systemStore from '../../models/System';
import { I18nContext } from '../../models/Translation';
import { UserCredential } from '../../models/types';
import userStore from '../../models/User';
import userCredentialStore from '../../models/UserCredential';

export const CredentialCard: FC<UserCredential> = observer(
  ({
    id,
    uuid,
    algorithm,
    transports = [],
    authenticator,
    synced,
    userVerified,
  }) => {
    const { t } = useContext(I18nContext),
      { colorScheme } = systemStore;

    return (
      <ListGroup.Item className="d-flex align-items-start gap-3">
        <img
          className="rounded object-fit-contain flex-shrink-0"
          width={40}
          height={40}
          loading="lazy"
          src={
            colorScheme === 'dark'
              ? authenticator?.icon_dark
              : authenticator?.icon_light
          }
          alt={authenticator?.name || 'WebAuthn'}
        />
        <div className="flex-grow-1 min-w-0 text-break">
          <p className="mb-1 text-truncate">
            {authenticator?.name || 'WebAuthn'}
          </p>
          <p className="mb-0 small text-secondary">{uuid}</p>
          <p className="mt-1 mb-0 small text-secondary">
            {[
              algorithm,
              transports.join(', '),
              synced && t('credential_synced'),
              userVerified && t('user_verified'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <Button
          variant="outline-danger"
          size="sm"
          disabled={userCredentialStore.uploading > 0}
          onClick={() =>
            confirm(`${t('delete')} ${uuid} ?`) &&
            userCredentialStore.deleteOne(id)
          }
        >
          {t('delete')}
        </Button>
      </ListGroup.Item>
    );
  },
);

export interface CredentialListProps {
  email: string;
}

export const CredentialList: FC<CredentialListProps> = observer(({ email }) => {
  const { t } = useContext(I18nContext);
  const loading = userCredentialStore.uploading + userStore.uploading > 0;

  useEffect(() => {
    userCredentialStore.refreshList().catch(() => {});
  }, []);

  return (
    <section className="d-flex flex-column gap-3 pt-4">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <h3 className="h6 mb-1">{t('webauthn_credentials')}</h3>
          <p className="small text-secondary mb-0">
            {t('webauthn_credentials_description')}
          </p>
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          disabled={loading || !email}
          onClick={() => email && userCredentialStore.createOne(email)}
        >
          {loading ? <Spinner animation="border" size="sm" /> : t('create')}
        </Button>
      </div>

      {userCredentialStore.allItems[0] ? (
        <ListGroup
          variant="flush"
          className="overflow-auto"
          style={{ maxHeight: '15rem' }}
        >
          {userCredentialStore.allItems.map(credential => (
            <CredentialCard key={credential.id} {...credential} />
          ))}
        </ListGroup>
      ) : (
        <p className="text-secondary border border-dashed rounded p-3 mb-0">
          {t('webauthn_credentials_empty')}
        </p>
      )}
    </section>
  );
});
