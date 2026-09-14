import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';
import { FormEvent, MouseEvent } from 'react';
import { Button, Form, InputGroup, Tab, Tabs } from 'react-bootstrap';
import { formToJSON } from 'web-utility';

import { i18n, I18nContext } from '../../models/Translation';
import userStore from '../../models/User';

interface SignInData {
  email: string;
  password: string;
}

export interface SessionFormProps {
  onSignIn?: (data?: SignInData) => unknown;
}

@observer
export class SessionForm extends ObservedComponent<SessionFormProps, typeof i18n> {
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
      <Form className="d-flex flex-column gap-3" onSubmit={this.handleSubmit}>
        <Tabs
          activeKey={signType}
          className="mb-1"
          onSelect={key => key && (this.signType = key as typeof signType)}
        >
          <Tab eventKey="up" title={t('register')} />
          <Tab eventKey="in" title={t('login')} />
        </Tabs>

        <Form.Group>
          <Form.Label>{t('email')}</Form.Label>
          <Form.Control
            name="email"
            type="email"
            required
            placeholder={t('please_enter_email')}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>{t('password')}</Form.Label>
          <InputGroup>
            <Form.Control
              name="password"
              type="password"
              required
              placeholder={t('please_enter_password')}
            />
            {signType === 'in' && (
              <>
                <Button
                  type="button"
                  variant="outline-secondary"
                  title="Email OTP"
                  disabled={loading}
                  onClick={this.handleEmailOTP}
                >
                  OTP
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  title="WebAuthn"
                  disabled={loading}
                  onClick={this.handleWebAuthn}
                >
                  WebAuthn
                </Button>
              </>
            )}
          </InputGroup>
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {signType === 'up' ? t('register') : t('login')}
        </Button>
      </Form>
    );
  }
}
