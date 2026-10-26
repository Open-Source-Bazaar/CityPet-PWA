import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent, reaction } from 'mobx-react-helper';
import { FormField } from 'mobx-restful-table';
import { PropsWithChildren, SubmitEvent } from 'react';
import { Alert, Button, Container, Form, Nav, Spinner } from 'react-bootstrap';

import { AuthChannel, authStore } from '../../models/Auth';
import { CloudBaseEnv } from '../../models/configuration';
import { SessionProps } from '../../models/Session';
import { i18n, I18nContext } from '../../models/Translation';

export type AuthGuardProps = SessionProps &
  PropsWithChildren<{ channel?: AuthChannel }>;

@observer
export class AuthGuard extends ObservedComponent<AuthGuardProps, typeof i18n> {
  static contextType = I18nContext;

  @observable
  accessor channel: AuthChannel = this.props.channel || 'phone';

  componentDidMount() {
    super.componentDidMount();
    this.init();
  }

  @reaction(({ observedProps }) => observedProps.jwtPayload)
  @action
  init() {
    authStore.acceptPayload(this.observedProps.jwtPayload);
  }

  submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authStore.verifyOtp) void authStore.signIn();
    else void authStore.sendOTP(this.channel);
  };

  @action
  changeChannel(channel: AuthChannel) {
    if (channel === this.channel || authStore.uploading > 0) return;

    this.channel = channel;
    authStore.setAccount('');
    authStore.resetCode();
  }

  renderChannelNav() {
    const { t } = this.observedContext;
    const uploading = authStore.uploading > 0;

    return (
      <Nav className="mb-3" fill variant="pills" activeKey={this.channel}>
        {(['phone', 'email'] as const).map(channel => (
          <Nav.Item key={channel}>
            <Nav.Link
              as="button"
              type="button"
              eventKey={channel}
              disabled={uploading}
              aria-pressed={this.channel === channel}
              onClick={() => this.changeChannel(channel)}
            >
              {t(channel === 'phone' ? 'auth_phone' : 'auth_email')}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    );
  }

  renderAccountInput() {
    const { channel } = this;
    const { t } = this.observedContext;

    return (
      <FormField
        id="auth-account"
        className="mb-3"
        label={t(channel === 'email' ? 'auth_email' : 'auth_phone')}
        type={channel === 'email' ? 'email' : 'tel'}
        autoComplete={channel === 'email' ? 'email' : 'tel'}
        required
        pattern={channel === 'phone' ? '\\+?[0-9]{6,15}' : undefined}
        value={authStore.account}
        readOnly={!!authStore.verifyOtp || authStore.uploading > 0}
        onChange={({ target }) => authStore.setAccount(target.value)}
      />
    );
  }

  renderCodeInput() {
    const { t } = this.observedContext;

    return (
      <div className="mb-3">
        <FormField
          id="auth-code"
          className="mb-2"
          label={t('auth_code')}
          autoComplete="one-time-code"
          inputMode="numeric"
          required
          pattern={'\\s*\\S+\\s*'}
          value={authStore.token}
          disabled={authStore.uploading > 0}
          onChange={({ target }) => authStore.setToken(target.value)}
        />
        <Form.Text>{t('auth_sent')}</Form.Text>
      </div>
    );
  }

  renderCodeActions() {
    const { t } = this.observedContext;
    const uploading = authStore.uploading > 0;

    return (
      <>
        <Button
          type="button"
          variant="outline-primary"
          className="ms-2"
          disabled={uploading}
          onClick={() => authStore.sendOTP(this.channel)}
        >
          {t('auth_resend')}
        </Button>
        <Button
          type="button"
          variant="link"
          disabled={uploading}
          onClick={() => authStore.resetCode()}
        >
          {t('auth_change_account')}
        </Button>
      </>
    );
  }

  renderLogin() {
    const { t } = this.observedContext;
    const { verifyOtp, errorKey } = authStore;
    const uploading = authStore.uploading > 0;

    return (
      <Container className="py-4" style={{ maxWidth: 480 }}>
        <h1 className="text-center">{t('auth_submit')}</h1>
        {!CloudBaseEnv && (
          <Alert variant="warning">{t('cloudbase_config_required')}</Alert>
        )}
        {errorKey && <Alert variant="danger">{t(errorKey)}</Alert>}
        <Form onSubmit={this.submit}>
          <fieldset disabled={uploading || !CloudBaseEnv}>
            {this.renderChannelNav()}
            {this.renderAccountInput()}
            {verifyOtp && this.renderCodeInput()}
            <div className="text-center">
              <Button type="submit" disabled={uploading || !CloudBaseEnv}>
                {uploading && <Spinner size="sm" className="me-2" />}
                {t(verifyOtp ? 'auth_submit' : 'auth_send')}
              </Button>
              {verifyOtp && this.renderCodeActions()}
            </div>
          </fieldset>
        </Form>
      </Container>
    );
  }

  render() {
    return this.props.jwtPayload?.user ? (
      <>{this.props.children}</>
    ) : (
      this.renderLogin()
    );
  }
}
