import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sei } from 'viem/chains';
import { getRedisClient } from '@/lib/kv';
import { VAULT_CONTRACT_ADDRESS } from '@/lib/constants';
import { VAULT_ABI } from '@/lib/abis';

const publicClient = createPublicClient({
    chain: sei,
    transport: http(),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const secret = searchParams.get('secret');
    const redis = getRedisClient();

    if (force && secret !== process.env.CACHE_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        if (redis && !force) {
            const cached = await redis.get('top_stakers_v3');
            if (cached) {
                return NextResponse.json(cached);
            }
        }
    } catch (redisError) {
        console.warn('Redis error:', redisError);
    }

    try {
        const stakerAddresses: string[] = [];
        let index = 0;
        let hasMore = true;

        // 1. Fetch all staker addresses from stakersArray
        // We iterate until the contract reverts to find the total count
        while (hasMore) {
            try {
                // Batch fetch in chunks of 20 to avoid too many round trips
                const promises = [];
                for (let i = 0; i < 20; i++) {
                    promises.push(
                        publicClient.readContract({
                            address: VAULT_CONTRACT_ADDRESS,
                            abi: VAULT_ABI,
                            functionName: 'stakersArray',
                            args: [BigInt(index + i)],
                        }).catch(() => null)
                    );
                }

                const results = await Promise.all(promises);
                const validAddresses = results.filter((addr): addr is `0x${string}` => addr !== null);

                if (validAddresses.length === 0) {
                    hasMore = false;
                } else {
                    stakerAddresses.push(...validAddresses);
                    index += 20;
                    // If we got fewer than 20, it means we hit the end
                    if (validAddresses.length < 20) {
                        hasMore = false;
                    }
                }
            } catch {
                hasMore = false;
            }

            // Safety break to prevent infinite loops in case of unexpected network behavior
            if (index > 5000) break;
        }

        // 2. Fetch stake info for all addresses using multicall
        // This is much faster than individual calls
        const stakeInfoResults = await publicClient.multicall({
            contracts: stakerAddresses.map((addr) => ({
                address: VAULT_CONTRACT_ADDRESS,
                abi: VAULT_ABI,
                functionName: 'getStakeInfo',
                args: [addr],
            })),
        });

        const stakerList = stakerAddresses.map((address, i) => {
            const result = stakeInfoResults[i];
            const amount = result.status === 'success' ? (result.result as [bigint, bigint])[0] : 0n;
            return { address, amount: amount.toString() };
        }).filter(s => BigInt(s.amount) > 0n);

        // 3. Sort and slice top 5
        const topStakers = stakerList
            .sort((a, b) => (BigInt(b.amount) > BigInt(a.amount) ? 1 : -1))
            .slice(0, 5);

        // 4. Calculate total staked for percentage calculations
        const totalStaked = stakerList.reduce((acc, curr) => acc + BigInt(curr.amount), 0n);

        const responseData = {
            stakers: topStakers,
            totalStaked: totalStaked.toString(),
            updatedAt: Date.now()
        };

        try {
            if (redis) {
                await redis.set('top_stakers_v3', responseData, { ex: 300 }); // 5 min TTL
            }
        } catch (redisSetError) {
            console.warn('Redis set error:', redisSetError);
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ stakers: [], totalStaked: '0', updatedAt: Date.now() });
    }
}
