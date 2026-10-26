import './setup';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import Router from 'next/router';

import { getCloudBaseClient } from '../components/User/CloudBase';
import { AuthModel } from '../models/Auth';
import { isSessionPayload } from '../models/Session';

test('OTP flows trim accounts and codes, exchange access tokens and reload only after server sign-in', async context => {
  const model = new AuthModel();
  const auth = getCloudBaseClient().auth();
  const verifier = context.mock.fn(async () => ({ error: null }));
  const otp = context.mock.method(auth, 'signInWithOtp', async () => ({
    data: { verifyOtp: verifier },
    error: null,
  }));
  context.mock.method(auth, 'getAccessToken', async () => ({
    accessToken: 'test-access-token',
  }));
  const payload = { user: { id: 'user-id', email: 'user@example.test' } };
  const exchange = context.mock.method(model.client, 'post', async () => ({
    body: payload,
  }));
  const reload = context.mock.method(Router, 'reload', () => {});

  model.setAccount(' user@example.test ');
  await model.sendOTP('email');
  assert.deepEqual(otp.mock.calls[0].arguments, [
    { email: 'user@example.test' },
  ]);
  assert.equal(model.verifyOtp, verifier);
  assert.equal(model.uploading, 0);
  assert.equal(model.status, 'signedOut');
  assert.equal(exchange.mock.callCount(), 0);

  model.setToken(' 123456 ');
  await model.signIn();
  assert.deepEqual(verifier.mock.calls[0].arguments, [{ token: '123456' }]);
  assert.deepEqual(exchange.mock.calls[0].arguments, [
    'user/session',
    { accessToken: 'test-access-token' },
  ]);
  assert.deepEqual(model.identity, payload);
  assert.equal(model.status, 'signedIn');
  assert.equal(model.userName, 'user@example.test');
  assert.equal(model.verifyOtp, undefined);
  assert.equal(model.token, '');
  assert.equal(reload.mock.callCount(), 1);

  model.setAccount(' +8613800000000 ');
  await model.sendOTP('phone');
  assert.deepEqual(otp.mock.calls[1].arguments, [{ phone: '+8613800000000' }]);
  model.setToken('old-code');
  await model.sendOTP('phone');
  assert.equal(model.token, '');
  assert.equal(otp.mock.callCount(), 3);
  model.resetCode();
  assert.equal(model.verifyOtp, undefined);
});

test('missing verification callbacks and access tokens are visible and cannot create a session', async context => {
  const model = new AuthModel();
  const auth = getCloudBaseClient().auth();
  context.mock.method(auth, 'signInWithOtp', async () => ({
    data: {},
    error: null,
  }));
  const exchange = context.mock.method(model.client, 'post', async () => {
    throw new Error('Must not exchange an invalid OTP session');
  });
  const reload = context.mock.method(Router, 'reload', () => {});

  model.setAccount('user@example.test');
  await model.sendOTP('email');
  assert.equal(model.errorKey, 'auth_missing_verifier');
  await model.signIn();
  assert.equal(model.errorKey, 'auth_missing_verifier');

  model.verifyOtp = async () => ({ data: {}, error: null });
  context.mock.method(auth, 'getAccessToken', async () => ({
    accessToken: '',
  }));
  await model.signIn();
  assert.equal(model.errorKey, 'auth_missing_session');
  assert.equal(model.uploading, 0);
  assert.equal(exchange.mock.callCount(), 0);
  assert.equal(reload.mock.callCount(), 0);
});

test('SDK and API failures propagate without leaving busy or signed-in state', async context => {
  const model = new AuthModel();
  const auth = getCloudBaseClient().auth();
  const error = new Error('OTP rejected');
  context.mock.method(auth, 'signInWithOtp', async () => {
    throw error;
  });
  await assert.rejects(model.sendOTP('email'), error);
  assert.equal(model.uploading, 0);
  assert.equal(model.identity, undefined);

  model.verifyOtp = async () => {
    throw error;
  };
  await assert.rejects(model.signIn(), error);
  assert.equal(model.uploading, 0);
  const reload = context.mock.method(Router, 'reload', () => {});
  context.mock.method(model.client, 'put', async () => {
    throw error;
  });
  await assert.rejects(model.refreshIdentity(), error);
  assert.equal(model.downloading, 0);
  assert.equal(reload.mock.callCount(), 0);
});

test('session initialization and sign-out synchronize the server identity on public pages', async context => {
  const model = new AuthModel();
  const auth = getCloudBaseClient().auth();
  const payload = { user: { id: 'user-id', phone: '+8613800000000' } };
  const read = context.mock.method(model.client, 'get', async () => ({
    body: payload,
  }));
  context.mock.method(model.client, 'put', async () => ({ body: payload }));

  await model.loadSession();
  assert.deepEqual(read.mock.calls[0].arguments, ['user/session']);
  assert.deepEqual(model.identity, payload);
  await model.refreshIdentity();
  assert.equal(model.downloading, 0);

  context.mock.method(auth, 'signOut', async () => {});
  const clear = context.mock.method(model.client, 'delete', async () => ({}));
  const reload = context.mock.method(Router, 'reload', () => {});
  await model.signOut();
  assert.deepEqual(clear.mock.calls[0].arguments, ['user/session']);
  assert.equal(model.status, 'signedOut');
  assert.equal(model.account, '');
  assert.equal(model.uploading, 0);
  assert.equal(reload.mock.callCount(), 1);

  read.mock.restore();
  context.mock.method(model.client, 'get', async () => ({ body: null }));
  await model.loadSession();
  assert.equal(model.identity, undefined);
});

test('general session validation rejects legacy and malformed identity payloads', () => {
  for (const payload of [
    undefined,
    null,
    'token',
    {},
    { id: 0 },
    { user: null },
    { user: { id: '' } },
    { user: { id: 1 } },
    { user: { id: 'id', email: 42 } },
  ])
    assert.equal(isSessionPayload(payload), false);

  assert.ok(isSessionPayload({ user: { id: 'user-id' } }));
  assert.ok(
    isSessionPayload({
      user: { id: 'user-id', name: 'Name', phone: '+8613800000000' },
    }),
  );
});
