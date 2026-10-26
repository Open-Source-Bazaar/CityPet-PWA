import { sign } from 'jsonwebtoken';
import { Context } from 'koa';
import { createKoaRouter, withKoaRouter } from 'next-ssr-middleware';
import { Day } from 'web-utility';

import { parseJWT, safeAPI, verifyJWT } from '../../../lib/API';
import { CloudBaseUser, getCloudBaseUser } from '../../../lib/CloudBase';
import { JWT_SECRET } from '../../../models/configuration';
import { isSessionPayload, SessionPayload } from '../../../models/Session';

export const config = { api: { bodyParser: false } };

const router = createKoaRouter(import.meta.url);

const sessionUserOf = (user: CloudBaseUser): SessionPayload['user'] => ({
  id: user.sub || user.user_id!,
  ...(user.name || user.username ? { name: user.name || user.username } : {}),
  ...(user.email ? { email: user.email } : {}),
  ...(user.phone_number ? { phone: user.phone_number } : {}),
  ...(user.picture ? { picture: user.picture } : {}),
});

const cookieOptions = () => ({
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  overwrite: true,
});

function issueSession(context: Context, user: SessionPayload['user']) {
  if (!JWT_SECRET) context.throw(503, 'JWT_SECRET is required');

  const identity: SessionPayload = { user };

  if (!isSessionPayload(identity))
    context.throw(502, 'CloudBase returned an invalid user profile');

  const token = sign(identity, JWT_SECRET, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn: '7d',
  });

  context.cookies.set('token', token, {
    ...cookieOptions(),
    maxAge: 7 * Day,
  });
  context.body = identity;
}

router.use(safeAPI, async (context, next) => {
  context.set('Cache-Control', 'private, no-store');

  return next();
});

router.get('/', parseJWT, (context: Context) => {
  context.body = isSessionPayload(context.state.user)
    ? { user: context.state.user.user }
    : 'null';
  context.type = 'application/json';
  context.status = 200;
});

router.post('/', async (context: Context) => {
  const body: unknown = Reflect.get(context.request, 'body');
  const accessToken =
    body && typeof body === 'object' && 'accessToken' in body
      ? body.accessToken
      : undefined;

  if (typeof accessToken !== 'string' || !accessToken.trim())
    context.throw(400, 'A CloudBase access token is required');

  const user = await getCloudBaseUser(accessToken);

  issueSession(context, sessionUserOf(user));
});

router.put('/', verifyJWT, (context: Context) => {
  const { user } = context.state.user as SessionPayload;

  issueSession(context, user);
});

router.delete('/', (context: Context) => {
  context.cookies.set('token', '', {
    ...cookieOptions(),
    expires: new Date(0),
  });
  context.status = 204;
});

const handleSession = withKoaRouter({ proxy: true }, router);

export default async function session(
  ...args: Parameters<typeof handleSession>
) {
  await handleSession(...args);
}
