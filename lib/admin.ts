import { env } from 'cloudflare:workers';
import { platformIdentity } from './http';
export function isAdmin(request: Request) {
  const identity = platformIdentity(request);
  const allowed =
    (env as unknown as { FEEDBACK_ADMIN_EMAILS?: string })
      .FEEDBACK_ADMIN_EMAILS || '';
  return (
    !!identity &&
    allowed
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .includes(identity.email.toLowerCase())
  );
}
