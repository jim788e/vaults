'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCcw, ExternalLink, Loader2, TrendingUp, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { formatUnits } from 'viem';
import { VAULT_CONTRACT_ADDRESS } from '@/lib/constants';
import { VAULT_ABI } from '@/lib/abis';

interface Staker {
    address: string;
    amount: string;
}

interface ApiResponse {
    stakers: Staker[];
    totalStaked: string;
    updatedAt: number;
}

export const TopStakers = () => {
    const { address: userAddress } = useAccount();
    const [data, setData] = useState<ApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch reward configuration for calculations
    const { data: rewardRatio } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getRewardRatio',
    });

    const { data: timeUnit } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getTimeUnit',
    });

    const fetchStakers = useCallback(async (force = false) => {
        setIsRefreshing(true);
        try {
            const res = await fetch(`/api/top-stakers${force ? '?force=true' : ''}`);
            const json = await res.json();
            if (json && Array.isArray(json.stakers)) {
                setData(json);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStakers();
        const interval = setInterval(() => fetchStakers(), 300000); // 5 mins auto-refresh
        return () => clearInterval(interval);
    }, [fetchStakers]);

    const formatAmount = (val: string) => {
        return Number(formatUnits(BigInt(val), 18)).toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const calculateDailyRewards = (stakedAmount: bigint) => {
        if (!rewardRatio || !timeUnit || timeUnit === 0n) return '0';
        const [numerator, denominator] = rewardRatio as [bigint, bigint];
        const secondsInDay = 86400n;

        // Rewards = (stakedAmount * numerator * secondsInDay) / (denominator * timeUnit)
        const dailyRewards = (stakedAmount * numerator * secondsInDay) / (denominator * BigInt(timeUnit as bigint));
        return Number(formatUnits(dailyRewards, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    const calculatePercentage = (stakedAmount: bigint) => {
        if (!data || !data.totalStaked || data.totalStaked === '0') return '0';
        const total = BigInt(data.totalStaked);
        return ((Number(stakedAmount) * 100) / Number(total)).toFixed(1);
    };

    const medals = ['🥇', '🥈', '🥉'];
    const rowStyles = [
        'bg-yellow-500/5 border-yellow-500/20',
        'bg-slate-400/5 border-slate-400/20',
        'bg-amber-700/5 border-amber-700/20'
    ];

    if (isLoading) {
        return (
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[400px] backdrop-blur-xl">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group/container">
            {/* Glossy Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/5">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Hall of Fame</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top 5 Resource Providers</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchStakers(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 active:scale-95 group"
                >
                    <RefreshCcw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sync</span>
                </button>
            </div>

            <div className="space-y-3 relative z-10">
                {(!data || data.stakers.length === 0) ? (
                    <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active stakers found</p>
                    </div>
                ) : (
                    data.stakers.map((staker, index) => {
                        const isUser = staker.address.toLowerCase() === userAddress?.toLowerCase();
                        const amountBI = BigInt(staker.amount);

                        return (
                            <div
                                key={staker.address}
                                className={clsx(
                                    "flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-[1.5rem] border transition-all duration-500 group",
                                    index < 3 ? rowStyles[index] : "border-white/5 bg-white/[0.02]",
                                    isUser ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20" : "hover:bg-white/[0.05] hover:border-white/10"
                                )}
                            >
                                {/* Rank & Profile */}
                                <div className="flex items-center gap-5 mb-4 md:mb-0">
                                    <div className="w-10 h-10 flex items-center justify-center text-xl shrink-0 font-black">
                                        {index < 3 ? medals[index] : <span className="text-gray-600 text-sm">#{index + 1}</span>}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                                                {staker.address.slice(0, 6)}...{staker.address.slice(-4)}
                                            </p>
                                            <a
                                                href={`https://seitrace.com/address/${staker.address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink className="w-3 h-3 text-gray-500 hover:text-white" />
                                            </a>
                                            {isUser && (
                                                <span className="bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider shadow-lg shadow-blue-500/20">You</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase">{calculatePercentage(amountBI)}% of Pool</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-8 justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-xl font-black text-white leading-none mb-1 group-hover:scale-105 transition-transform origin-right">
                                            {formatAmount(staker.amount)}
                                        </p>
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">MOOZ Staked</p>
                                    </div>

                                    <div className="w-px h-8 bg-white/5 hidden sm:block" />

                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end mb-1">
                                            <Calendar className="w-3 h-3 text-green-500" />
                                            <p className="text-sm font-black text-green-400 tabular-nums">
                                                +{calculateDailyRewards(amountBI)}
                                            </p>
                                        </div>
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">wSEI / Day</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Status */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Next update in ~{Math.max(0, Math.floor((300000 - (Date.now() - (data?.updatedAt || Date.now()))) / 1000 / 60))}m</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic">Protected by Sei Network Secure RPC</span>
                </div>
            </div>

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        </div>
    );
};
