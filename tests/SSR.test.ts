import './setup';

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { sign } from 'jsonwebtoken';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AuthGuard } from '../components/User/AuthGuard';
import { getServerSideProps } from '../pages/user/me';

test('login form uses stable control IDs across server and client renders', () => {
  const first = renderToStaticMarkup(createElement(AuthGuard, {}));
  const second = renderToStaticMarkup(createElement(AuthGuard, {}));

  assert.equal(first, second);
  assert.match(first, /id="auth-account"/);
  assert.match(first, /for="auth-account"/);
});

test('profile SSR verifies request cookies without sharing identity and disables caching', async context => {
  context.mock.method(console, 'error', () => {});
  const server = createServer(async (request, response) => {
    const cookies = Object.fromEntries(
      (request.headers.cookie || '')
        .split(';')
        .filter(Boolean)
        .map(cookie => cookie.trim().split('=')),
    );

    try {
      const result = await getServerSideProps({
        req: Object.assign(request, { cookies }),
        res: response,
        query: {},
        resolvedUrl: '/user/me',
      });

      assert.ok('props' in result);
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(await result.props));
    } catch (error) {
      response.statusCode = 500;
      response.end(error instanceof Error ? error.message : String(error));
    }
  });
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
  const url = `http://127.0.0.1:${address.port}/user/me`;

  for (const user of [{ id: 'first-user' }, { id: 'second-user' }]) {
    const token = sign({ user }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
    const profile = await fetch(url, { headers: { Cookie: `token=${token}` } });

    assert.equal(profile.status, 200);
    assert.equal(profile.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual((await profile.json()).jwtPayload.user, user);
  }

  for (const token of [
    '',
    'invalid',
    sign({ user: { id: 'expired' } }, process.env.JWT_SECRET!, {
      expiresIn: -1,
    }),
  ]) {
    const anonymous = await fetch(url, {
      headers: token ? { Cookie: `token=${token}` } : {},
    });
    assert.equal(anonymous.status, 200);
    assert.equal(anonymous.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual(await anonymous.json(), {});
  }

  const malformed = sign({ id: 0 }, process.env.JWT_SECRET!);
  const rejected = await fetch(url, {
    headers: { Cookie: `token=${malformed}` },
  });
  assert.equal(rejected.status, 500);
  assert.equal(await rejected.text(), 'Invalid user session payload');
});
