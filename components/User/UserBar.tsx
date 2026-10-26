import { observer } from 'mobx-react';
import { HTMLAttributes, useContext } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';

import { authStore } from '../../models/Auth';
import { I18nContext } from '../../models/Translation';

const UserBar = observer((props: HTMLAttributes<HTMLDivElement>) => {
  const { t } = useContext(I18nContext);
  const { status, userName, uploading } = authStore;
  const pending = uploading > 0;

  return (
    <div {...props}>
      {status === 'signedIn' ? (
        <DropdownButton
          id="user-menu"
          title={userName || t('auth_user')}
          variant="outline-light"
          align="end"
          disabled={pending}
        >
          <Dropdown.Item href="/user/me">{t('user_details')}</Dropdown.Item>
          <Dropdown.Item disabled={pending} onClick={() => authStore.signOut()}>
            {t('auth_sign_out')}
          </Dropdown.Item>
        </DropdownButton>
      ) : (
        <Button
          variant="outline-light"
          disabled={status === 'checking' || pending}
          href="/user/me"
        >
          {t('auth_submit')}
        </Button>
      )}
    </div>
  );
});

export default UserBar;
