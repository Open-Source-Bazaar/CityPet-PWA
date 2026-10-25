import { FormEvent, useContext, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Form } from 'react-bootstrap';

import { I18nContext } from '../../models/Translation';
import { getUserAuth } from '../../models/User';

type Method = 'email' | 'phone';

type Verification = Awaited<
  ReturnType<ReturnType<typeof getUserAuth>['signInWithOtp']>
>['data'];

export function SessionForm() {
  const { t } = useContext(I18nContext);
  const [auth, setAuth] = useState<ReturnType<typeof getUserAuth> | null>(null);
  const [method, setMethod] = useState<Method>('email');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [verification, setVerification] = useState<Verification | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const userAuth = getUserAuth();

      setAuth(userAuth);

      const {
        data: { subscription },
      } = userAuth.onAuthStateChange((event, session) =>
        setSignedIn(event !== 'SIGNED_OUT' && Boolean(session?.user)),
      );
      unsubscribe = () => subscription.unsubscribe();
    } catch {
      setError('configuration');
    }

    return () => unsubscribe?.();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (verification?.verifyOtp) {
        const { error } = await verification.verifyOtp({ token: code.trim() });

        if (error) throw error;

        setSignedIn(true);
        setMessage(t('login_success'));
      } else if (auth) {
        const result = await auth.signInWithOtp(
          method === 'email'
            ? { email: identifier.trim() }
            : { phone: identifier.trim() },
        );

        if (result.error) throw result.error;
        if (!result.data.verifyOtp) throw new Error(t('authentication_failed'));

        setVerification(result.data);
        setMessage(t('code_sent'));
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t('authentication_failed'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!auth) return;

    setBusy(true);
    setError('');

    try {
      const result = await auth.signOut();

      if (result && 'error' in result && result.error) throw result.error;

      setSignedIn(false);
      setVerification(null);
      setCode('');
      setMessage('');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t('authentication_failed'),
      );
    } finally {
      setBusy(false);
    }
  }

  function changeMethod(nextMethod: Method) {
    setMethod(nextMethod);
    setVerification(null);
    setCode('');
    setMessage('');
    setError('');
  }

  return (
    <section className="mx-auto" style={{ maxWidth: 480 }}>
      <h1 className="my-4 text-center">{t('session')}</h1>

      {message && <Alert variant="success">{message}</Alert>}
      {error && (
        <Alert variant="danger">
          {error === 'configuration' ? t('cloudbase_config_required') : error}
        </Alert>
      )}

      {signedIn ? (
        <Button
          className="w-100"
          disabled={busy}
          variant="outline-primary"
          onClick={signOut}
        >
          {busy ? t('signing_out') : t('sign_out')}
        </Button>
      ) : (
        <Form onSubmit={submit}>
          <ButtonGroup className="mb-3 w-100">
            <Button
              disabled={Boolean(verification) || busy}
              variant={method === 'email' ? 'primary' : 'outline-primary'}
              onClick={() => changeMethod('email')}
            >
              {t('email')}
            </Button>
            <Button
              disabled={Boolean(verification) || busy}
              variant={method === 'phone' ? 'primary' : 'outline-primary'}
              onClick={() => changeMethod('phone')}
            >
              {t('phone')}
            </Button>
          </ButtonGroup>

          <Form.Group className="mb-3">
            <Form.Label>{t(method === 'email' ? 'email' : 'phone')}</Form.Label>
            <Form.Control
              autoComplete={method === 'email' ? 'email' : 'tel'}
              disabled={Boolean(verification) || busy || !auth}
              placeholder={method === 'phone' ? '+8613800138000' : undefined}
              required
              type={method === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={({ target }) => setIdentifier(target.value)}
            />
            {method === 'phone' && <Form.Text>{t('phone_format')}</Form.Text>}
          </Form.Group>

          {verification && (
            <Form.Group className="mb-3">
              <Form.Label>{t('verification_code')}</Form.Label>
              <Form.Control
                autoComplete="one-time-code"
                autoFocus
                disabled={busy}
                inputMode="numeric"
                required
                value={code}
                onChange={({ target }) => setCode(target.value)}
              />
            </Form.Group>
          )}

          <div className="d-flex gap-2">
            <Button
              className="flex-fill"
              disabled={busy || !auth}
              type="submit"
            >
              {busy
                ? verification
                  ? t('verifying')
                  : t('sending_code')
                : verification
                  ? t('verify_and_sign_in')
                  : t('send_code')}
            </Button>

            {verification && (
              <Button
                disabled={busy}
                type="button"
                variant="outline-secondary"
                onClick={() => changeMethod(method)}
              >
                {t('change')}
              </Button>
            )}
          </div>
        </Form>
      )}
    </section>
  );
}
