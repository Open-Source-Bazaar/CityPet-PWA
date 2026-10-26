export const isServer = () => typeof window === 'undefined';

export const Name = process.env.NEXT_PUBLIC_SITE_NAME,
  Summary = process.env.NEXT_PUBLIC_SITE_SUMMARY,
  CloudBaseEnv = process.env.NEXT_PUBLIC_CLOUDBASE_ENV,
  CloudBaseAccessKey = process.env.NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY;

export const { CI, VERCEL_URL, GITHUB_TOKEN, JWT_SECRET } = process.env;

export const API_Host = isServer()
  ? VERCEL_URL
    ? `https://${VERCEL_URL}`
    : 'http://localhost:3000'
  : globalThis.location.origin;
