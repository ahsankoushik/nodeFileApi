
// singleton for redis
import { createClient } from 'redis';

const globalForRedis = globalThis;

let redis;

if (!globalForRedis.redis) {
  redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redis.on('error', (err) => console.error('Redis Client Error', err));

  await redis.connect(); 

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
  }
} else {
  redis = globalForRedis.redis;
}

export default redis;
