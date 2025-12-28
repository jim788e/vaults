import { Redis } from '@upstash/redis';

export const getRedisClient = () => {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        console.warn('Redis credentials not found');
        return null;
    }

    return new Redis({
        url,
        token,
    });
};
