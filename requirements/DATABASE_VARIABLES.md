# Database Environment Variables

> **Note**: This document is archived. The database/caching functionality described here was used for vaults/staking features that have been removed from the application.

## Database: Upstash Redis

The application previously used **Upstash Redis** for caching top stakers data. This functionality has been removed along with the vaults feature.

## Historical Information

### What These Variables Were Used For

- **Caching top stakers data** - Stored the top 5 stakers list for 30 minutes
- **Reduces API calls** - Prevented expensive blockchain queries on every request
- **Improves performance** - Faster page loads for the vaults/staking page

### Environment Variables (No Longer Needed)

```env
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# OR use KV_ prefix (both worked)
KV_REST_API_URL=https://your-redis-instance.upstash.io
KV_REST_API_TOKEN=your_redis_token_here
```

## Current Status

❌ **Not Required** - These variables are no longer needed as the vaults/staking functionality has been removed.

The `app/utils/kv.ts` file still contains the Redis client setup code for potential future use, but no active caching functionality is currently implemented.

## If You Need Redis in the Future

If you want to add caching or database functionality in the future:

1. The Redis client setup is available in `app/utils/kv.ts`
2. You can add new cache functions following the same pattern
3. The code supports both `UPSTASH_*` and `KV_*` naming conventions

