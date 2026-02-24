/**
 * HTTP Caching Headers Utility
 * Provides standardized cache control headers for API routes
 * Feature #322 - Performance optimization through client-side caching
 */

import { NextResponse } from 'next/server';

/**
 * Cache strategy types
 */
export type CacheStrategy =
  | 'default'     // Standard caching: private, 30s max-age, 60s stale-while-revalidate
  | 'no-cache'    // No caching: no-cache, no-store, must-revalidate
  | 'short'       // Short caching: private, 10s max-age, 20s stale-while-revalidate
  | 'medium'      // Medium caching: private, 60s max-age, 120s stale-while-revalidate
  | 'long';       // Long caching: private, 300s max-age, 600s stale-while-revalidate

/**
 * Get Cache-Control header value for a given strategy
 */
export function getCacheControlHeader(strategy: CacheStrategy = 'default'): string {
  switch (strategy) {
    case 'no-cache':
      return 'no-cache, no-store, must-revalidate';
    case 'short':
      return 'private, max-age=10, stale-while-revalidate=20';
    case 'medium':
      return 'private, max-age=60, stale-while-revalidate=120';
    case 'long':
      return 'private, max-age=300, stale-while-revalidate=600';
    case 'default':
    default:
      return 'private, max-age=30, stale-while-revalidate=60';
  }
}

/**
 * Apply cache headers to a NextResponse
 * @param response - The NextResponse object to add headers to
 * @param strategy - Cache strategy to apply
 * @returns The response with cache headers applied
 */
export function withCacheHeaders<T>(
  response: NextResponse<T>,
  strategy: CacheStrategy = 'default'
): NextResponse<T> {
  response.headers.set('Cache-Control', getCacheControlHeader(strategy));
  return response;
}

/**
 * Helper to create a JSON response with cache headers
 * @param data - Data to return
 * @param strategy - Cache strategy to apply
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with cache headers
 */
export function cachedJsonResponse<T>(
  data: T,
  strategy: CacheStrategy = 'default',
  status: number = 200
): NextResponse<T> {
  const response = NextResponse.json(data, { status });
  return withCacheHeaders(response, strategy);
}
