'use client';

import { useAccount, useReadContract } from 'wagmi';
import { VAULT_CONTRACT_ADDRESS, ADMIN_WALLETS } from '@/lib/constants';
import { VAULT_ABI } from '@/lib/abis';
import { formatUnits } from 'viem';
import { ShieldCheck, Info } from 'lucide-react';

export const AdminPanel = () => {
    const { address } = useAccount();

    const isAdmin = address && ADMIN_WALLETS.includes(address.toLowerCase());

    const { data: rewardBalance } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getRewardTokenBalance',
        query: { enabled: !!isAdmin },
    }) as { data: bigint | undefined };

    const { data: rewardRatio } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getRewardRatio',
        query: { enabled: !!isAdmin },
    }) as { data: [bigint, bigint] | undefined };


    if (!isAdmin) return null;

    const ratio = rewardRatio as [bigint, bigint];

    return (
        <div className="mt-8 p-8 rounded-[2.5rem] bg-linear-to-br from-purple-900/20 to-blue-900/10 border border-purple-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-black text-white">Admin Control Panel</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-1">Vault Reward Balance</p>
                    <p className="text-2xl font-black text-white">
                        {rewardBalance ? formatUnits(rewardBalance as bigint, 18) : '0'} <span className="text-sm text-gray-500 font-normal">wSEI</span>
                    </p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-1">Reward Multiplier</p>
                    <p className="text-2xl font-black text-white">
                        {ratio ? `${ratio[0].toString()} / ${ratio[1].toString()}` : '0 / 0'}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-start gap-2 text-[10px] text-purple-300/60 leading-relaxed italic">
                <Info className="w-3 h-3 mt-0.5" />
                <p>This panel is only visible to project administrators. Data is fetched in real-time from the smart contract.</p>
            </div>
        </div>
    );
};
