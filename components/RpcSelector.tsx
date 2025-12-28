'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Zap, Check } from 'lucide-react';
import { RPC_OPTIONS, PREFERRED_RPC_KEY } from '@/lib/rpc-config';
import { checkRpcStatus, RpcStatus } from '@/lib/rpc-utils';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const RpcSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState<string>('');
    const [statuses, setStatuses] = useState<Record<string, RpcStatus>>({});
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const checkAllStatuses = useCallback(async () => {
        const results = await Promise.all(
            RPC_OPTIONS.map(async (opt) => ({
                url: opt.url,
                status: await checkRpcStatus(opt.url),
            }))
        );

        const newStatuses: Record<string, RpcStatus> = {};
        results.forEach((res) => {
            newStatuses[res.url] = res.status;
        });

        setStatuses(newStatuses);
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const saved = localStorage.getItem(PREFERRED_RPC_KEY);
        Promise.resolve().then(() => {
            setSelectedUrl(saved || RPC_OPTIONS[0].url);
            checkAllStatuses();
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mounted, checkAllStatuses]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && mounted) {
            Promise.resolve().then(() => checkAllStatuses());
            interval = setInterval(checkAllStatuses, 10000);
        }
        return () => clearInterval(interval);
    }, [isOpen, mounted, checkAllStatuses]);

    const handleSelect = (url: string, isDefault?: boolean) => {
        if (isDefault) {
            localStorage.removeItem(PREFERRED_RPC_KEY);
        } else {
            localStorage.setItem(PREFERRED_RPC_KEY, url);
        }
        setSelectedUrl(url);
        window.location.reload();
    };

    if (!mounted) return null;

    const currentStatus = statuses[selectedUrl]?.color || 'green';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all shadow-inner"
            >
                <div className={clsx(
                    "w-2.5 h-2.5 rounded-full animate-pulse",
                    currentStatus === 'green' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" :
                        currentStatus === 'yellow' ? "bg-yellow-500" : "bg-red-500"
                )} />
                <span className="text-sm font-black text-gray-200">RPC</span>
                <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        className="absolute right-0 mt-3 w-80 rounded-[2rem] bg-slate-900/95 border border-white/10 p-3 shadow-2xl z-50 backdrop-blur-2xl"
                    >
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                            <h3 className="text-sm font-black text-white tracking-widest uppercase opacity-80">Network Connections</h3>
                        </div>

                        <div className="space-y-1.5">
                            {RPC_OPTIONS.map((option) => {
                                const status = statuses[option.url];
                                const isSelected = selectedUrl === option.url;

                                return (
                                    <button
                                        key={option.url}
                                        onClick={() => handleSelect(option.url, option.isDefault)}
                                        className={clsx(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group",
                                            isSelected ? "bg-blue-600/10 border border-blue-500/30" : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                            isSelected ? "border-blue-500 bg-blue-500" : "border-gray-700 group-hover:border-gray-600"
                                        )}>
                                            {isSelected && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                                        </div>

                                        <div className="flex-1 text-left">
                                            <p className={clsx("text-base font-black leading-none", isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-200")}>
                                                {option.name}
                                            </p>
                                            <p className="text-[11px] font-mono text-gray-600 mt-1.5 group-hover:text-gray-500">
                                                {status?.blockHeight ? `#${status.blockHeight}` : '#--------'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5">
                                            {status ? (
                                                <>
                                                    <span className={clsx(
                                                        "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                                                        status.color === 'green' ? "bg-green-500/20 text-green-400" :
                                                            status.color === 'yellow' ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-400"
                                                    )}>
                                                        {status.status}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-gray-600">{status.latency}ms</span>
                                                </>
                                            ) : (
                                                <div className="w-12 h-4 bg-white/5 animate-pulse rounded" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 flex items-start gap-3">
                            <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-yellow-500/70 leading-[1.4] font-medium">
                                Choose high-speed nodes for faster transaction confirmations and smoother data updates.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
