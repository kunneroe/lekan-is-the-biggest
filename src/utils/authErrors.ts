import axios from 'axios';
import { parseApiError } from './parseApiError';

export type AuthErrorKind = 'credentials' | 'network' | 'tooMany' | 'exists' | 'other';

export type AuthErrorInfo = {
  kind: AuthErrorKind;
  title: string;
  message: string;
};

/** Words that mean a message is internal plumbing, not something to show a shopper. */
const TECHNICAL = /token|status code|undefined|null|exception|stack|axios|ECONN|\bjwt\b|\[object/i;

/**
 * Turns a failed login or sign-up into words a shopper understands.
 *
 * A wrong password answers 401. The shared request layer treats every 401 as an
 * expired session and tries to refresh it, which fails with "No refresh token
 * available" when nobody is signed in yet. That leaked message, a 401/403 on login,
 * or a failed call to /auth/refresh all mean the same thing here: the details
 * didn't match.
 */
export function describeAuthError(error: unknown, mode: 'login' | 'register'): AuthErrorInfo {
  const raw = error instanceof Error ? error.message : '';

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    if (!error.response) {
      return {
        kind: 'network',
        title: "Can't reach Grabit",
        message: 'Check your internet connection and try again.',
      };
    }
    if (status === 429) {
      return {
        kind: 'tooMany',
        title: 'Too many tries',
        message: 'For your security, please wait a minute before trying again.',
      };
    }
    if (mode === 'login' && (status === 401 || status === 403 || status === 404 || url.includes('/auth/refresh'))) {
      return credentials();
    }
    if (mode === 'register' && (status === 409 || /exist|already|taken|in use|registered/i.test(parseApiError(error)))) {
      return {
        kind: 'exists',
        title: 'You already have an account',
        message: 'That email or phone number is already registered. Log in instead, or reset your password.',
      };
    }
    if (mode === 'login' && status === 400 && /password|credential|invalid|incorrect|match/i.test(parseApiError(error))) {
      return credentials();
    }
  } else if (mode === 'login' && /refresh token|unauthori[sz]ed|session/i.test(raw)) {
    return credentials();
  }

  const fallback =
    mode === 'login' ? 'We could not log you in. Please try again.' : 'We could not create your account. Please try again.';
  let message = parseApiError(error, { fallback });
  if (TECHNICAL.test(message) || message.length > 160) message = fallback;
  return {
    kind: 'other',
    title: mode === 'login' ? "Couldn't log you in" : "Couldn't create your account",
    message,
  };
}

function credentials(): AuthErrorInfo {
  return {
    kind: 'credentials',
    title: "That didn't match",
    message: 'The email, phone number or password is incorrect. Check them and try again, or reset your password.',
  };
}
