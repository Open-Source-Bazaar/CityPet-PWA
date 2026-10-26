import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/cloudbase/:path*', '/auth/:path*', '/v1/:path*'],
};

export function proxy(request: NextRequest) {
  const env = process.env.NEXT_PUBLIC_CLOUDBASE_ENV;

  if (!env) throw new Error('NEXT_PUBLIC_CLOUDBASE_ENV is required');

  const headers = new Headers(request.headers);
  const cloudAPI =
    request.nextUrl.pathname === '/cloudbase/cloud-api' ||
    request.nextUrl.pathname.startsWith('/cloudbase/cloud-api/');
  const host = `${env}.${cloudAPI ? 'ap-shanghai.tcb-api.tencentcloudapi.com' : 'api.tcloudbasegateway.com'}`;

  // External rewrites rebuild X-Forwarded-Host from Host.
  headers.set('Host', host);
  headers.set('X-Forwarded-Host', host);
  headers.set('Origin', process.env.CLOUDBASE_ORIGIN || request.nextUrl.origin);

  return NextResponse.next({ request: { headers } });
}
