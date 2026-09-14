import { UserCredential } from '@idea2app/data-server';
import { observer } from 'mobx-react';
import { ScrollList } from 'mobx-restful-table';
import { FC, useContext } from 'react';
import { Button, Card } from 'react-bootstrap';

import systemStore from '../../models/System';
import { i18n, I18nContext } from '../../models/Translation';
import userStore from '../../models/User';
import userCredentialStore from '../../models/UserCredential';

/**
 * Card component presenting a registered WebAuthn credential.
 *
 * @param credential - Registered user credential attributes.
 */
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

    const iconSrc =
      colorScheme === 'dark'
        ? authenticator?.icon_dark
        : authenticator?.icon_light;

    const metadata = [
      algorithm,
      transports.join(', '),
      synced && t('credential_synced'),
      userVerified && t('user_verified'),
    ]
      .filter(Boolean)
      .join(' · ');

    return (
      <Card className="mb-2 shadow-sm">
        <Card.Body className="d-flex align-items-start justify-content-between gap-3">
          {iconSrc && (
            <img
              className="rounded"
              style={{ width: 40, height: 40, objectFit: 'contain' }}
              loading="lazy"
              src={iconSrc}
              alt={authenticator?.name || 'WebAuthn'}
            />
          )}
          <div className="flex-grow-1 text-truncate">
            <h5 className="h6 mb-1 text-truncate">
              {authenticator?.name || 'WebAuthn'}
            </h5>
            <div className="text-muted small text-break">{uuid}</div>
            {metadata && (
              <div className="text-muted small mt-1">{metadata}</div>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline-danger"
            disabled={userCredentialStore.uploading > 0}
            onClick={() =>
              confirm(`${t('delete')} ${uuid} ?`) &&
              userCredentialStore.deleteOne(id)
            }
          >
            {t('delete')}
          </Button>
        </Card.Body>
      </Card>
    );
  },
);

export interface CredentialListProps {
  email: string;
}

/**
 * List component rendering all registered WebAuthn credentials for the active user.
 *
 * @param props - Component properties containing user email.
 */
export const CredentialList: FC<CredentialListProps> = observer(({ email }) => {
  const { t } = useContext(I18nContext);
  const loading = userCredentialStore.uploading + userStore.uploading > 0;

  return (
    <section className="d-flex flex-column gap-3 pt-2">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <h4 className="h6 mb-1">{t('webauthn_credentials')}</h4>
          <p className="text-muted small mb-0">
            {t('webauthn_credentials_description')}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline-primary"
          disabled={loading || !email}
          onClick={() => email && userCredentialStore.createOne(email)}
        >
          {t('create')}
        </Button>
      </div>

      <ScrollList
        translator={i18n}
        store={userCredentialStore}
        renderList={allItems =>
          allItems[0] ? (
            <div className="d-flex flex-column">
              {allItems.map(credential => (
                <CredentialCard key={credential.id} {...credential} />
              ))}
            </div>
          ) : (
            <div className="text-muted p-3 border rounded text-center small">
              {t('webauthn_credentials_empty')}
            </div>
          )
        }
      />
    </section>
  );
});
