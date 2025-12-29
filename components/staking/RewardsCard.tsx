'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { VAULT_CONTRACT_ADDRESS } from '@/lib/constants';
import { VAULT_ABI } from '@/lib/abis';
import { formatUnits } from 'viem';
import { useState } from 'react';
import { Coins, Loader2, Sparkles } from 'lucide-react';
import { FallingCoins } from './FallingCoins';

export const RewardsCard = () => {
    const { address } = useAccount();
    const [isClaiming, setIsClaiming] = useState(false);

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

    const { writeContractAsync } = useWriteContract();

    const stakedAmount = userStakeInfo ? (userStakeInfo as [bigint, bigint])[0] : 0n;
    const rewards = userStakeInfo ? (userStakeInfo as [bigint, bigint])[1] : 0n;

    const handleClaim = async () => {
        if (!address || rewards === 0n) return;
        setIsClaiming(true);
        try {
            await writeContractAsync({
                address: VAULT_CONTRACT_ADDRESS,
                abi: VAULT_ABI,
                functionName: 'claimRewards',
            });
            // Wait for confirmation if needed, but the async call handles the initiation
        } catch (err) {
            console.error(err);
        } finally {
            setIsClaiming(false);
        }
    };

    const formatRewards = (val: bigint) => {
        return Number(formatUnits(val, 18)).toLocaleString(undefined, { maximumSignificantDigits: 6 });
    };

    return (
        <div className="relative overflow-hidden bg-linear-to-br from-indigo-950 via-gray-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl">
            {stakedAmount > 0n && <FallingCoins />}

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-pink-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>

                <p className="text-gray-400 text-sm font-medium mb-2">Unclaimed WSEI Rewards</p>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter break-all">
                    {formatRewards(rewards)} <span className="text-lg md:text-xl text-gray-500 font-bold ml-1">WSEI</span>
                </h2>

                <button
                    onClick={handleClaim}
                    disabled={rewards === 0n || isClaiming}
                    className="group relative flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-black font-black hover:bg-cyan-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xl"
                >
                    {isClaiming ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Coins className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    )}
                    {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                </button>
            </div>
        </div>
    );
};
