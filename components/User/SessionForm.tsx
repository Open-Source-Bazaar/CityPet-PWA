import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';
import { FormEvent, MouseEvent } from 'react';
import { Button, Form, Tab, Tabs } from 'react-bootstrap';
import { formToJSON } from 'web-utility';

import { i18n, I18nContext } from '../../models/Translation';
import { SignInData } from '../../models/types';
import userStore from '../../models/User';

export interface SessionFormProps {
  onSignIn?: (data?: SignInData) => any;
}

@observer
export class SessionForm extends ObservedComponent<
  SessionFormProps,
  typeof i18n
> {
  static contextType = I18nContext;

  @observable
  accessor signType: 'up' | 'in' = 'in';

  handleWebAuthn = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await userStore.signInWebAuthn();

    this.props.onSignIn?.();
  };

  handleEmailOTP = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const { t } = this.observedContext;
    const { email } = formToJSON<SignInData>(event.currentTarget.form!);

    if (!email) throw new URIError(t('email_required_for_OTP'));

    await userStore.sendOTP(email);

    alert(t('OTP_sent_to_email'));
  };

  handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const { t } = this.observedContext;
    const { email, password } = formToJSON<SignInData>(event.currentTarget);

    if (this.signType === 'up') {
      await userStore.signUp(email, password);

      this.signType = 'in';

      alert(t('registration_success_please_login'));
    } else {
      await userStore.signIn(email, password);

      this.props.onSignIn?.({ email, password });
    }
  };

  render() {
    const { signType } = this,
      loading = userStore.uploading > 0;

    const { t } = this.observedContext;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Tabs
          activeKey={signType}
          className="mb-3"
          fill
          onSelect={key => (this.signType = key as 'up' | 'in')}
        >
          <Tab eventKey="up" title={t('register')} />
          <Tab eventKey="in" title={t('login')} />
        </Tabs>

        <Form.Group className="mb-3" controlId="session-email">
          <Form.Label>{t('email')}</Form.Label>
          <Form.Control
            name="email"
            type="email"
            required
            placeholder={t('please_enter_email')}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="session-password">
          <Form.Label>{t('password')}</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              name="password"
              type="password"
              required
              placeholder={t('please_enter_password')}
            />
            {signType === 'in' && (
              <Button
                variant="outline-secondary"
                title="Email OTP"
                disabled={loading}
                onClick={this.handleEmailOTP}
              >
                OTP
              </Button>
            )}
            {signType === 'in' && (
              <Button
                variant="outline-secondary"
                title="WebAuthn"
                disabled={loading}
                onClick={this.handleWebAuthn}
              >
                WebAuthn
              </Button>
            )}
          </div>
        </Form.Group>

        <Button
          className="w-100 mt-2"
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {signType === 'up' ? t('register') : t('login')}
        </Button>
      </Form>
    );
  }
}
