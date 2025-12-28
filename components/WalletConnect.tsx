'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export const WalletConnect = () => {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    if (!mounted) return null;


    const handleConnect = () => {
        // For simplicity, we connect the first available connector (usually injected)
        if (connectors.length > 0) {
            connect({ connector: connectors[0] });
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (!isConnected) {
        return (
            <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-linear-to-r from-pink-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-pink-500/20"
            >
                <Wallet className="w-4 h-4" />
                Connect Wallet
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-sm">{formatAddress(address!)}</span>
                <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-gray-900/90 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50">
                    <button
                        onClick={() => {
                            disconnect();
                            setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-white/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};
