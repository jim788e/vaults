'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { Trophy, RefreshCcw, ExternalLink, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { formatUnits } from 'viem';

interface Staker {
    address: string;
    amount: string;
}

export const TopStakers = () => {
    const { address: userAddress } = useAccount();
    const [stakers, setStakers] = useState<Staker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStakers = async (force = false) => {
        setIsRefreshing(true);
        try {
            const res = await fetch(`/api/top-stakers${force ? '?force=true' : ''}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setStakers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStakers();
        const interval = setInterval(() => fetchStakers(), 300000); // 5 mins
        return () => clearInterval(interval);
    }, []);

    const formatAmount = (val: string) => {
        return Number(formatUnits(BigInt(val), 18)).toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const medals = ['🥇', '🥈', '🥉'];
    const colors = [
        'border-yellow-500/50 shadow-yellow-500/10',
        'border-gray-400/50 shadow-gray-400/10',
        'border-amber-600/50 shadow-amber-600/10'
    ];

    if (isLoading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Loading leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-black text-white">Top 5 Stakers</h2>
                </div>
                <button
                    onClick={() => fetchStakers(true)}
                    disabled={isRefreshing}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                    <RefreshCcw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
                </button>
            </div>

            <div className="space-y-4">
                {stakers.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No stakers found yet.</p>
                ) : (
                    stakers.map((staker, index) => {
                        const isUser = staker.address.toLowerCase() === userAddress?.toLowerCase();
                        return (
                            <div
                                key={staker.address}
                                className={clsx(
                                    "relative group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                    index < 3 ? colors[index] : "border-white/5 bg-white/[0.02] shadow-xs",
                                    isUser ? "bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20" : "hover:bg-white/[0.05]"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl w-8 text-center">
                                        {index < 3 ? medals[index] : `#${index + 1}`}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-sm text-gray-300">
                                                {staker.address.slice(0, 6)}...{staker.address.slice(-4)}
                                            </p>
                                            {isUser && (
                                                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">Sei Network Staker</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white leading-none mb-1">
                                            {formatAmount(staker.amount)}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right">MOOZ Staked</p>
                                    </div>
                                    <a
                                        href={`https://seitrace.com/address/${staker.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-white/5 text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                <span>Updated every 5 minutes</span>
                <span>Verified on Sei Network</span>
            </div>
        </div>
    );
};
