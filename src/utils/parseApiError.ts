import axios from 'axios';

export type ParseApiErrorOptions = {
  /** Shown when no specific message can be extracted from the error. */
  fallback?: string;
  /** Used for 401 responses that do not include a body message (e.g. expired session). */
  unauthorizedFallback?: string;
};

const DEFAULT_FALLBACK = 'Something went wrong. Please try again.';
const DEFAULT_UNAUTHORIZED =
  'Your session has expired. Please sign in again.';
const NETWORK_UNAVAILABLE =
  'Unable to reach the server. Check your internet connection and try again.';
const REQUEST_TIMEOUT =
  'The request timed out. Check your connection and try again.';
const SERVER_UNAVAILABLE =
  'The server is temporarily unavailable. Please try again in a moment.';

function extractMessageFromData(data: unknown): string | null {
  if (data == null) return null;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.length > 0 && trimmed.length < 200) return trimmed;
    return null;
  }

  if (typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;

  if (typeof obj.error === 'string' && obj.error.trim()) {
    return obj.error.trim();
  }

  if (typeof obj.message === 'string' && obj.message.trim()) {
    return obj.message.trim();
  }

  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    const first = obj.errors[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (typeof first === 'object' && first !== null) {
      const errObj = first as Record<string, unknown>;
      if (typeof errObj.msg === 'string' && errObj.msg.trim()) {
        return errObj.msg.trim();
      }
      if (typeof errObj.message === 'string' && errObj.message.trim()) {
        return errObj.message.trim();
      }
    }
  }

  return null;
}

/**
 * Converts Axios and unknown errors into a user-friendly message string.
 * Supports backend `{ error }`, fallback `{ message }`, validation arrays, and network failures.
 */
export function parseApiError(
  error: unknown,
  options: ParseApiErrorOptions = {},
): string {
  const fallback = options.fallback ?? DEFAULT_FALLBACK;
  const unauthorizedFallback =
    options.unauthorizedFallback ?? DEFAULT_UNAUTHORIZED;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        return extractMessageFromData(data) ?? unauthorizedFallback;
      }

      if (status >= 500) {
        return extractMessageFromData(data) ?? SERVER_UNAVAILABLE;
      }

      const fromBody = extractMessageFromData(data);
      if (fromBody) return fromBody;

      return fallback;
    }

    if (error.request) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return REQUEST_TIMEOUT;
      }
      return NETWORK_UNAVAILABLE;
    }

    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}
