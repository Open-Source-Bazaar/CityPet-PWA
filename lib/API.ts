import { Context, Middleware } from 'koa';
import JWT from 'koa-jwt';
import { HTTPError } from 'koajax';
import { KoaOption, withKoa } from 'next-ssr-middleware';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

import { JWT_SECRET } from '../models/configuration';
import { isSessionPayload } from '../models/Session';

const { HTTP_PROXY } = process.env;

if (HTTP_PROXY) setGlobalDispatcher(new ProxyAgent(HTTP_PROXY));

const sessionJWT =
  (passthrough: boolean): Middleware =>
  async (context, next) => {
    if (passthrough && !context.cookies.get('token')) return next();
    if (!JWT_SECRET) return context.throw(503, 'JWT_SECRET is required');

    return JWT({
      secret: JWT_SECRET,
      cookie: 'token',
      algorithms: ['HS256'],
      passthrough,
    })(context, next);
  };

export const parseJWT = sessionJWT(true);

export const verifyJWT: Middleware = async (context, next) =>
  sessionJWT(false)(context, async () => {
    if (!isSessionPayload(context.state.user))
      context.throw(401, 'A valid user session is required');

    return next();
  });

export const safeAPI: Middleware<any, any> = async (context: Context, next) => {
  try {
    return await next();
  } catch (error) {
    if (!(error instanceof HTTPError)) {
      console.error(error);

      context.status =
        error &&
        typeof error === 'object' &&
        'status' in error &&
        typeof error.status === 'number'
          ? error.status
          : 400;

      return (context.body = { message: (error as Error).message });
    }
    const { message, response } = error;
    let { body } = response;

    context.status = response.status;
    context.statusMessage = message;

    if (body instanceof ArrayBuffer)
      try {
        body = new TextDecoder().decode(new Uint8Array(body));

        body = JSON.parse(body);
      } catch {
        //
      }
    console.error(JSON.stringify(body, null, 2));

    context.body = body;
  }
};

export const withSafeKoa = <S, C>(...middlewares: Middleware<S, C>[]) =>
  withKoa<S, C>({} as KoaOption, safeAPI, ...middlewares);
