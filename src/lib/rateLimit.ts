/**
 * Server-side rate limiting for auth endpoints using Upstash Redis.
 * When UPSTASH_REDIS_REST_URL/TOKEN are not set, rate limiting is skipped (e.g. local dev).
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const COOLDOWN_MINUTES = 10;
const RATE_LIMIT_MESSAGE = 'Te veel pogingen. Probeer over X minuten opnieuw.';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Get client IP from request (supports Vercel, Cloudflare, and common proxies).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf;
  return 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') ?? '';
}

const redis = getRedis();

// Login-code: 10 per IP per 15 min, 5 per code-prefix per 15 min
const loginCodeByIp = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      prefix: 'toernooiprof:auth:login-code:ip',
    })
  : null;

const loginCodeByIdentifier = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'toernooiprof:auth:login-code:id',
    })
  : null;

// Firebase login: 20 per IP per 15 min
const loginByIp = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '15 m'),
      prefix: 'toernooiprof:auth:login:ip',
    })
  : null;

// Register: 5 per IP per 15 min, 3 per email per hour
const registerByIp = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'toernooiprof:auth:register:ip',
    })
  : null;

const registerByEmail = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      prefix: 'toernooiprof:auth:register:email',
    })
  : null;

// Verify: 5 per IP per 15 min, 5 per email per 15 min
const verifyByIp = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'toernooiprof:auth:verify:ip',
    })
  : null;

const verifyByEmail = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
        prefix: 'toernooiprof:auth:verify:email',
    })
  : null;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; message: string };

function retryAfterFromReset(reset: number): number {
  const seconds = Math.ceil((reset - Date.now()) / 1000);
  return Math.max(1, Math.min(seconds, COOLDOWN_MINUTES * 60));
}

/**
 * Check rate limit for login-code: by IP and by code prefix (first 4 chars).
 * Only call increment/limit for failed attempts; on success we don't need to count.
 */
export async function checkLoginCodeLimit(
  request: NextRequest,
  codePrefix: string
): Promise<RateLimitResult> {
  if (!loginCodeByIp || !loginCodeByIdentifier) return { allowed: true };

  const ip = getClientIp(request);
  const ipKey = `ip:${ip}`;
  const idKey = `prefix:${codePrefix}`;

  const [ipResult, idResult] = await Promise.all([
    loginCodeByIp.limit(ipKey),
    loginCodeByIdentifier.limit(idKey),
  ]);

  if (!ipResult.success) {
    const retry = retryAfterFromReset(ipResult.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  if (!idResult.success) {
    const retry = retryAfterFromReset(idResult.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  return { allowed: true };
}

/**
 * Check rate limit for Firebase login (per IP).
 */
export async function checkLoginLimit(request: NextRequest): Promise<RateLimitResult> {
  if (!loginByIp) return { allowed: true };

  const ip = getClientIp(request);
  const result = await loginByIp.limit(`ip:${ip}`);

  if (!result.success) {
    const retry = retryAfterFromReset(result.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  return { allowed: true };
}

/**
 * Check rate limit for register: per IP and per email.
 */
export async function checkRegisterLimit(
  request: NextRequest,
  email: string
): Promise<RateLimitResult> {
  if (!registerByIp || !registerByEmail) return { allowed: true };

  const ip = getClientIp(request);
  const normalizedEmail = email.trim().toLowerCase();

  const [ipResult, emailResult] = await Promise.all([
    registerByIp.limit(`ip:${ip}`),
    registerByEmail.limit(`email:${normalizedEmail}`),
  ]);

  if (!ipResult.success) {
    const retry = retryAfterFromReset(ipResult.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  if (!emailResult.success) {
    const retry = retryAfterFromReset(emailResult.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  return { allowed: true };
}

/**
 * Check rate limit for verify: per IP and per email.
 */
export async function checkVerifyLimit(
  request: NextRequest,
  email: string
): Promise<RateLimitResult> {
  if (!verifyByIp || !verifyByEmail) return { allowed: true };

  const ip = getClientIp(request);
  const normalizedEmail = email.trim().toLowerCase();

  const [ipResult, emailResult] = await Promise.all([
    verifyByIp.limit(`ip:${ip}`),
    verifyByEmail.limit(`email:${normalizedEmail}`),
  ]);

  if (!ipResult.success) {
    const retry = retryAfterFromReset(ipResult.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  if (!emailResult.success) {
    const retry = retryAfterFromReset(emailResult.reset);
    return {
      allowed: false,
      retryAfterSeconds: retry,
      message: RATE_LIMIT_MESSAGE.replace('X', String(Math.ceil(retry / 60))),
    };
  }
  return { allowed: true };
}

/**
 * Build 429 response with Retry-After and generic error message.
 */
export function rateLimit429(result: { retryAfterSeconds: number; message: string }) {
  return NextResponse.json(
    { error: result.message },
    {
      status: 429,
      headers: { 'Retry-After': String(result.retryAfterSeconds) },
    }
  );
}
