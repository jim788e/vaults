'use client';

import { useAccount, useReadContract } from 'wagmi';
import { VAULT_CONTRACT_ADDRESS } from '@/lib/constants';
import { VAULT_ABI } from '@/lib/abis';
import { formatUnits } from 'viem';

export const VaultStats = () => {
    const { address, isConnected } = useAccount();
    const { data: totalStaked } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'stakingTokenBalance',
        query: { refetchInterval: 15000 },
    }) as { data: bigint | undefined };

    const { data: userStakeInfo } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getStakeInfo',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 15000
        },
    }) as { data: [bigint, bigint] | undefined };

    const formatAmount = (val: bigint | undefined) => {
        if (!val) return '0';
        return Number(formatUnits(val, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    if (!isConnected) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <p className="text-gray-400 text-sm font-medium mb-1">Total Pool Staked</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                    {formatAmount(totalStaked as bigint)} <span className="text-sm text-gray-500 font-normal">MOOZ</span>
                </h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <p className="text-gray-400 text-sm font-medium mb-1">Your Staked Balance</p>
                <h3 className="text-3xl font-bold bg-linear-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                    {formatAmount(userStakeInfo ? (userStakeInfo as [bigint, bigint])[0] : 0n)} <span className="text-sm text-gray-500 font-normal">MOOZ</span>
                </h3>
            </div>
        </div>
    );
};
