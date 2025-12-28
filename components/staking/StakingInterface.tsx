'use client';

import { useAccount, useReadContract, useWriteContract, useBlockNumber } from 'wagmi';
import { VAULT_CONTRACT_ADDRESS, STAKING_TOKEN_ADDRESS } from '@/lib/constants';
import { VAULT_ABI, ERC20_ABI } from '@/lib/abis';
import { formatUnits, parseUnits } from 'viem';
import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const StakingInterface = () => {
    const { address } = useAccount();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const [activeTab, setActiveTab] = useState<'stake' | 'withdraw'>('stake');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'approving' | 'staking' | 'withdrawing' | 'success' | 'error'>('idle');

    // Contracts Reads
    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    }) as { data: bigint | undefined, refetch: () => void };

    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: STAKING_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, VAULT_CONTRACT_ADDRESS] : undefined,
        query: { enabled: !!address },
    }) as { data: bigint | undefined, refetch: () => void };

    const { data: userStakeInfo, refetch: refetchStaked } = useReadContract({
        address: VAULT_CONTRACT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getStakeInfo',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    }) as { data: [bigint, bigint] | undefined, refetch: () => void };

    const stakedAmount = userStakeInfo ? userStakeInfo[0] : 0n;

    const { writeContractAsync } = useWriteContract();

    useEffect(() => {
        if (status !== 'idle' && status !== 'success' && status !== 'error') return;
        refetchBalance();
        refetchAllowance();
        refetchStaked();
    }, [blockNumber, refetchBalance, refetchAllowance, refetchStaked, status]);

    const handleMax = () => {
        if (activeTab === 'stake') {
            setAmount(formatUnits((balanceData as bigint) || 0n, 18).split('.')[0]);
        } else {
            setAmount(formatUnits(stakedAmount, 18).split('.')[0]);
        }
    };

    const handleAction = async () => {
        if (!address || !amount || isNaN(Number(amount))) return;
        const amountBigInt = parseUnits(amount, 18);

        try {
            if (activeTab === 'stake') {
                const allowance = (allowanceData as bigint) || 0n;
                if (allowance < amountBigInt) {
                    setStatus('approving');
                    await writeContractAsync({
                        address: STAKING_TOKEN_ADDRESS,
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [VAULT_CONTRACT_ADDRESS, amountBigInt],
                    });
                    // Wait for confirmation logic could be added here
                    // For now we assume approval is fast or user will click stake again
                    setStatus('idle');
                    return;
                }

                setStatus('staking');
                await writeContractAsync({
                    address: VAULT_CONTRACT_ADDRESS,
                    abi: VAULT_ABI,
                    functionName: 'stake',
                    args: [amountBigInt],
                });
            } else {
                setStatus('withdrawing');
                await writeContractAsync({
                    address: VAULT_CONTRACT_ADDRESS,
                    abi: VAULT_ABI,
                    functionName: 'withdraw',
                    args: [amountBigInt],
                });
            }
            setStatus('success');
            setAmount('');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const isStakeEnabled = activeTab === 'stake' && Number(amount) > 0 && Number(amount) <= Number(formatUnits((balanceData as bigint) || 0n, 18));
    const isWithdrawEnabled = activeTab === 'withdraw' && Number(amount) > 0 && Number(amount) <= Number(formatUnits(stakedAmount, 18));

    const needsApproval = activeTab === 'stake' && ((allowanceData as bigint) || 0n) < parseUnits(amount || '0', 18);

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-1 shadow-inner h-full flex flex-col">
            <div className="flex p-2">
                <button
                    onClick={() => { setActiveTab('stake'); setStatus('idle'); }}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all",
                        activeTab === 'stake' ? "bg-white text-black shadow-lg" : "text-gray-400 hover:bg-white/5"
                    )}
                >
                    <ArrowUpCircle className="w-4 h-4" />
                    Stake
                </button>
                <button
                    onClick={() => { setActiveTab('withdraw'); setStatus('idle'); }}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all",
                        activeTab === 'withdraw' ? "bg-white text-black shadow-lg" : "text-gray-400 hover:bg-white/5"
                    )}
                >
                    <ArrowDownCircle className="w-4 h-4" />
                    Withdraw
                </button>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        <span>{activeTab === 'stake' ? 'Available to stake' : 'Staked balance'}</span>
                        <span>{activeTab === 'stake' ? formatUnits((balanceData as bigint) || 0n, 18).split('.')[0] : formatUnits(stakedAmount, 18).split('.')[0]} MOOZ</span>
                    </div>


                    <div className="relative group">
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="0"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-2xl font-bold text-white placeholder-gray-700 focus:outline-hidden focus:border-cyan-500/50 transition-all"
                        />
                        <button
                            onClick={handleMax}
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-linear-to-r from-pink-500/10 to-cyan-500/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    {status === 'success' && (
                        <div className="mb-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400 text-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            Transaction successful!
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            Transaction failed. Please try again.
                        </div>
                    )}

                    <button
                        onClick={handleAction}
                        disabled={activeTab === 'stake' ? !isStakeEnabled : !isWithdrawEnabled}
                        className={clsx(
                            "w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-3",
                            activeTab === 'stake' ? "bg-linear-to-r from-pink-500 to-cyan-500 text-white" : "bg-white text-black"
                        )}
                    >
                        {status === 'approving' || status === 'staking' || status === 'withdrawing' ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : null}

                        {status === 'approving' ? 'Approving MOOZ...' :
                            status === 'staking' ? 'Staking MOOZ...' :
                                status === 'withdrawing' ? 'Withdrawing MOOZ...' :
                                    activeTab === 'stake' ? (needsApproval ? 'Approve & Stake' : 'Stake MOOZ') :
                                        'Withdraw MOOZ'}
                    </button>
                </div>
            </div>
        </div>
    );
};
