import { RedisClient } from 'bun';

export const redisClient = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Generic caching helper with TTL using Bun.redis
 */
export async function cacheOrFetch<T>(
  key: string,
  ttlInSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const freshData = await fetchFn();
  if (freshData !== null && freshData !== undefined) {
    await redisClient.set(key, JSON.stringify(freshData), 'EX', ttlInSeconds);
  }
  return freshData;
}