// Upstash Redis client utility (for future use)
// Works in both development and production on serverless platforms
// This file is kept for potential future caching/database needs
import { Redis } from '@upstash/redis';

// Initialize Redis client from environment variables
// Upstash Redis provides these variables when connected through Vercel Marketplace:
// - KV_REST_API_URL (or UPSTASH_REDIS_REST_URL)
// - KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_TOKEN)
//
// The code supports both naming conventions for flexibility

/**
 * Get Redis client instance if environment variables are configured
 * @returns Redis client instance or null if not configured
 */
export function getRedisClient(): Redis | null {
  // Try Upstash standard naming first, then fallback to KV_ prefix (what Upstash actually provides)
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  
  if (!url || !token) {
    return null;
  }
  
  return new Redis({ url, token });
}

// Redis utility functions can be added here for future use

