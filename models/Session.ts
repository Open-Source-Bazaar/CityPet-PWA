import type { JWTProps } from 'next-ssr-middleware';

export interface SessionPayload {
  user: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    picture?: string;
  };
}

export type SessionProps = JWTProps<SessionPayload>;

export function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== 'object' || !('user' in value)) return false;

  const { user } = value;

  return (
    !!user &&
    typeof user === 'object' &&
    'id' in user &&
    typeof user.id === 'string' &&
    !!user.id.trim() &&
    ['name', 'email', 'phone', 'picture'].every(
      key => !(key in user) || typeof Reflect.get(user, key) === 'string',
    )
  );
}
