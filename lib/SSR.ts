import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import { isSessionPayload, SessionProps } from '../models/Session';

export async function withSession<
  I extends ParsedUrlQuery,
  O extends SessionProps,
>(
  context: GetServerSidePropsContext<I>,
  next: () => Promise<GetServerSidePropsResult<O>>,
): Promise<GetServerSidePropsResult<O>> {
  context.res.setHeader('Cache-Control', 'private, no-store');

  const result = await next();
  if (!('props' in result)) return result;

  const props = await result.props;

  if (props.jwtPayload && !isSessionPayload(props.jwtPayload))
    throw new Error('Invalid user session payload');

  return { ...result, props };
}
