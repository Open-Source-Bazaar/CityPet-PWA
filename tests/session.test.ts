import './setup';

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { sign, verify } from 'jsonwebtoken';

import { cloudbaseAPI } from '../lib/CloudBase';
import handler from '../pages/api/user/session';

test('sessions validate CloudBase users, issue, read, refresh and clear production cookies', async context => {
  const originalNodeEnv = process.env.NODE_ENV;
  Reflect.set(process.env, 'NODE_ENV', 'production');
  context.after(() => {
    if (originalNodeEnv === undefined)
      Reflect.deleteProperty(process.env, 'NODE_ENV');
    else Reflect.set(process.env, 'NODE_ENV', originalNodeEnv);
  });
  context.mock.method(console, 'error', () => {});

  const lookup = context.mock.method(cloudbaseAPI, 'get', async () => ({
    body: { sub: 'test-user', email: 'user@example.test', name: 'Test User' },
  }));
  const server = createServer(handler);
  context.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close(error => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();
  assert.ok(address && typeof address !== 'string');

  const url = `http://127.0.0.1:${address.port}/api/user/session`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Forwarded-Proto': 'https',
  };
  const anonymous = await fetch(url);
  assert.equal(anonymous.status, 200);
  assert.equal(await anonymous.json(), null);
  assert.equal(anonymous.headers.get('cache-control'), 'private, no-store');

  for (const body of [{}, { accessToken: 1 }, { accessToken: '   ' }, null]) {
    const invalid = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.headers.has('set-cookie'), false);
  }
  assert.equal(lookup.mock.callCount(), 0);

  const login = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ accessToken: 'test-access-token' }),
  });
  assert.equal(login.status, 200);
  assert.equal(lookup.mock.callCount(), 1);
  assert.deepEqual(lookup.mock.calls[0].arguments, [
    'auth/v1/user/me',
    { Authorization: 'Bearer test-access-token' },
  ]);

  const cookie = login.headers.get('set-cookie');
  assert.ok(cookie);
  assert.match(cookie, /;\s*secure(?:;|$)/i);
  assert.match(cookie, /;\s*httponly(?:;|$)/i);
  assert.match(cookie, /;\s*samesite=lax/i);
  assert.match(cookie, /;\s*path=\//i);
  const expiry = cookie.match(/;\s*expires=([^;]+)/i)?.[1];
  assert.ok(expiry);
  assert.ok(
    Math.abs(Date.parse(expiry) - Date.now() - 7 * 24 * 60 * 60 * 1000) < 5000,
  );

  const [tokenCookie] = cookie.split(';');
  const identity = verify(
    tokenCookie.slice('token='.length),
    process.env.JWT_SECRET!,
  );
  assert.ok(typeof identity !== 'string');
  assert.equal(identity.sub, 'test-user');
  assert.equal(identity.exp! - identity.iat!, 7 * 24 * 60 * 60);
  const payload = await login.json();
  assert.deepEqual(payload, {
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'user@example.test',
    },
  });
  assert.deepEqual(identity.user, payload.user);

  const sessionHeaders = { ...headers, Cookie: tokenCookie };
  const current = await fetch(url, { headers: sessionHeaders });
  assert.equal(current.status, 200);
  assert.deepEqual(await current.json(), payload);
  assert.equal(current.headers.get('cache-control'), 'private, no-store');

  const refresh = await fetch(url, { method: 'PUT', headers: sessionHeaders });
  assert.equal(refresh.status, 200);
  assert.deepEqual(await refresh.json(), payload);
  assert.match(refresh.headers.get('set-cookie') || '', /;\s*secure(?:;|$)/i);

  for (const token of [
    'invalid',
    sign(payload, 'wrong-secret'),
    sign(payload, process.env.JWT_SECRET!, { expiresIn: -1 }),
    sign({ id: 0 }, process.env.JWT_SECRET!),
  ]) {
    const invalidHeaders = { ...headers, Cookie: `token=${token}` };
    const read = await fetch(url, { headers: invalidHeaders });
    assert.equal(await read.json(), null);

    const denied = await fetch(url, { method: 'PUT', headers: invalidHeaders });
    assert.equal(denied.status, 401);
    assert.equal(denied.headers.has('set-cookie'), false);
  }
  const denied = await fetch(url, { method: 'PUT', headers });
  assert.equal(denied.status, 401);

  const logout = await fetch(url, {
    method: 'DELETE',
    headers: sessionHeaders,
  });
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie') || '', /^token=;/);
  assert.match(logout.headers.get('set-cookie') || '', /;\s*secure(?:;|$)/i);
  assert.match(
    logout.headers.get('set-cookie') || '',
    /expires=Thu, 01 Jan 1970/i,
  );

  const expiredLogout = await fetch(url, {
    method: 'DELETE',
    headers: { ...headers, Cookie: 'token=expired' },
  });
  assert.equal(expiredLogout.status, 204);

  for (const protocol of [undefined, 'http']) {
    const insecureHeaders = new Headers({ 'Content-Type': 'application/json' });
    if (protocol) insecureHeaders.set('X-Forwarded-Proto', protocol);

    const insecure = await fetch(url, {
      method: 'POST',
      headers: insecureHeaders,
      body: JSON.stringify({ accessToken: 'test-access-token' }),
    });
    assert.equal(insecure.status, 400);
    assert.equal(insecure.headers.has('set-cookie'), false);
  }
});

test('session payloads contain only a valid general user', async context => {
  context.mock.method(console, 'error', () => {});
  const lookup = context.mock.method(cloudbaseAPI, 'get', async () => ({
    body: {},
  }));
  const server = createServer(handler);
  context.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close(error => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');

  const url = `http://127.0.0.1:${address.port}/api/user/session`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: 'test-access-token' }),
  };
  const invalid = await fetch(url, options);
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.has('set-cookie'), false);

  lookup.mock.mockImplementation(async () => ({
    body: { user_id: 'fallback-user', username: 'Fallback' },
  }));
  const login = await fetch(url, options);
  assert.equal(login.status, 200);
  assert.deepEqual(await login.json(), {
    user: { id: 'fallback-user', name: 'Fallback' },
  });
});
