import { Request } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { getRequiredJwtSecret } from '../config/runtime';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const API_RATE_LIMIT_PER_WINDOW = 200;
export const LOGIN_FAILURES_PER_WINDOW = 10;
export const PUBLIC_SUBMISSIONS_PER_HOUR = 10;

// "loopback" fits nginx on the same machine. Other setups (e.g. a Docker proxy)
// can set TRUST_PROXY to a hop count or an address list instead.
export function resolveTrustProxy(value = process.env.TRUST_PROXY): string | number | boolean {
  const trimmed = value?.trim();
  if (!trimmed) return 'loopback';
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === 'false') return false;
  if (trimmed === 'true') return true;
  return trimmed;
}

// True only for a token the API itself signed, so a made-up header cannot skip the limit.
export function hasValidAdminToken(req: Request): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;

  try {
    jwt.verify(header.slice('Bearer '.length), getRequiredJwtSecret());
    return true;
  } catch {
    return false;
  }
}

// Public traffic is limited per visitor IP. Signed-in admins are never limited,
// so uploading a large gallery from the dashboard cannot lock anyone out.
export function createApiLimiter() {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    max: API_RATE_LIMIT_PER_WINDOW,
    skip: hasValidAdminToken,
    message: {
      message: 'Too many requests. Please wait a few minutes and try again.',
      code: 'RATE_LIMITED',
    },
  });
}

// Public forms (contact, job applications with CV upload) write to the database and disk,
// so each visitor gets a small hourly budget.
export function createSubmissionLimiter() {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: PUBLIC_SUBMISSIONS_PER_HOUR,
    message: {
      message: 'Too many submissions. Please try again later.',
      code: 'SUBMISSION_RATE_LIMITED',
    },
  });
}

// Stricter limit on failed logins to slow down password guessing.
// Trade-off: after 10 failures from one IP, that IP must wait 15 minutes even with the right password.
export function createLoginLimiter() {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
    max: LOGIN_FAILURES_PER_WINDOW,
    skipSuccessfulRequests: true,
    message: {
      message: 'Too many failed login attempts. Please wait 15 minutes and try again.',
      code: 'LOGIN_RATE_LIMITED',
    },
  });
}
