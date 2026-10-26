import './setup';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';

import { config, proxy } from '../proxy';

test('CloudBase proxy matches only SDK namespaces', () => {
  for (const url of [
    '/cloudbase',
    '/cloudbase/cloud-api/web',
    '/cloudbase/v1/rdb/rest/test',
    '/auth/v1/verification',
    '/v1/storages/bucket/',
  ])
    assert.ok(unstable_doesMiddlewareMatch({ config, url }), url);

  for (const url of [
    '/',
    '/user/me',
    '/session',
    '/api/user/session',
    '/article/test',
    '/authentication',
    '/cloudbase-other',
    '/_next/static/test.js',
  ])
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), false, url);
});

test('CloudBase proxy selects upstream hosts and configurable origin without source project settings', context => {
  const originalOrigin = process.env.CLOUDBASE_ORIGIN;
  delete process.env.CLOUDBASE_ORIGIN;
  context.after(() => {
    if (originalOrigin === undefined) delete process.env.CLOUDBASE_ORIGIN;
    else process.env.CLOUDBASE_ORIGIN = originalOrigin;
  });

  for (const forwardedHost of [undefined, 'citypet.example.test']) {
    for (const [path, suffix] of [
      ['/auth/v1/verification', 'api.tcloudbasegateway.com'],
      ['/v1/storages/bucket', 'api.tcloudbasegateway.com'],
      ['/cloudbase/v1/rdb/rest/test', 'api.tcloudbasegateway.com'],
      ['/cloudbase/cloud-api-other/test', 'api.tcloudbasegateway.com'],
      ['/cloudbase/cloud-api', 'ap-shanghai.tcb-api.tencentcloudapi.com'],
      ['/cloudbase/cloud-api/web', 'ap-shanghai.tcb-api.tencentcloudapi.com'],
    ]) {
      const headers = new Headers({ Authorization: 'Bearer test-token' });
      if (forwardedHost) headers.set('X-Forwarded-Host', forwardedHost);
      const request = new NextRequest(`https://citypet.example.test${path}`, {
        headers,
      });
      const response = proxy(request);
      const host = `${process.env.NEXT_PUBLIC_CLOUDBASE_ENV}.${suffix}`;

      assert.equal(response.headers.get('x-middleware-request-host'), host);
      assert.equal(
        response.headers.get('x-middleware-request-x-forwarded-host'),
        host,
      );
      assert.equal(
        response.headers.get('x-middleware-request-authorization'),
        headers.get('Authorization'),
      );
      assert.equal(
        response.headers.get('x-middleware-request-origin'),
        'https://citypet.example.test',
      );
      assert.equal(
        request.headers.get('X-Forwarded-Host'),
        forwardedHost || null,
      );
    }
  }
  process.env.CLOUDBASE_ORIGIN = 'https://allowed.example.test';
  assert.equal(
    proxy(
      new NextRequest('https://citypet.example.test/auth/v1/user/me'),
    ).headers.get('x-middleware-request-origin'),
    'https://allowed.example.test',
  );
});
