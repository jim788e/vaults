import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { sei } from 'viem/chains';
import { getRedisClient } from '@/lib/kv';
import { VAULT_CONTRACT_ADDRESS } from '@/lib/constants';

const publicClient = createPublicClient({
    chain: sei,
    transport: http(),
});

interface LogWithArgs {
    args: {
        staker?: string;
        amount?: bigint;
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const redis = getRedisClient();

    try {
        if (redis && !force) {
            const cached = await redis.get('top_stakers');
            if (cached) {
                return NextResponse.json(cached);
            }
        }
    } catch (redisError) {
        console.warn('Redis error:', redisError);
    }

    try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 1000000n; // Safer range for public RPCs

        const [stakedLogs, withdrawnLogs] = await Promise.all([
            publicClient.getLogs({
                address: VAULT_CONTRACT_ADDRESS,
                event: parseAbiItem('event TokensStaked(address indexed staker, uint256 amount)'),
                fromBlock,
            }).catch(e => { console.error('Staked logs error:', e); return []; }),
            publicClient.getLogs({
                address: VAULT_CONTRACT_ADDRESS,
                event: parseAbiItem('event TokensWithdrawn(address indexed staker, uint256 amount)'),
                fromBlock,
            }).catch(e => { console.error('Withdrawn logs error:', e); return []; }),
        ]);

        const stakerMap: Record<string, bigint> = {};

        stakedLogs.forEach((log) => {
            const { staker, amount } = (log as unknown as LogWithArgs).args;
            if (staker && amount) {
                stakerMap[staker] = (stakerMap[staker] || 0n) + amount;
            }
        });

        withdrawnLogs.forEach((log) => {
            const { staker, amount } = (log as unknown as LogWithArgs).args;
            if (staker && amount) {
                stakerMap[staker] = (stakerMap[staker] || 0n) - amount;
            }
        });

        const topStakers = Object.entries(stakerMap)
            .map(([address, amount]) => ({ address, amount: amount.toString() }))
            .filter((s) => BigInt(s.amount) > 0n)
            .sort((a, b) => (BigInt(b.amount) > BigInt(a.amount) ? 1 : -1))
            .slice(0, 5);

        try {
            if (redis) {
                await redis.set('top_stakers', topStakers, { ex: 1800 });
            }
        } catch (redisSetError) {
            console.warn('Redis set error:', redisSetError);
        }

        return NextResponse.json(topStakers);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json([]);
    }
}
