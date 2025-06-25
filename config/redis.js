
// singleton for redis
import { createClient } from "redis";
import { REDIS_URL, NODE_ENV } from "./env.js"
const globalForRedis = globalThis;

let redis;

if (!globalForRedis.redis) {
    redis = createClient({
        url: REDIS_URL,
    });

    redis.on('error', (err) => console.error('Redis Client Error', err));

    await redis.connect();
    // to stop initialztio when using hot realoding
    if (NODE_ENV !== 'production') {
        globalForRedis.redis = redis;
    }
} else {
    redis = globalForRedis.redis;
}

export default redis;
