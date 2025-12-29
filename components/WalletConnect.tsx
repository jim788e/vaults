'use client';

import { useAccount, useConnect, useDisconnect, Connector } from 'wagmi';
import { useState, useEffect } from 'react';
import { Wallet, LogOut, ChevronDown, X, ExternalLink, Zap, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Image from 'next/image';

/* --- Portal Component --- */
const Portal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);
    return mounted ? createPortal(children, document.body) : null;
};

export const WalletConnect = () => {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();

    // Filter connectors: 
    // 1. Separate WalletConnect/Coinbase for "Popular"
    // 2. Hide "Injected" entirely if any other specific connector is present
    const installedConnectors = connectors.filter(c => {
        const isPopular = c.id === 'walletConnect' || c.id === 'coinbaseWallet' || c.id === 'coinbaseWalletSDK';
        if (isPopular) return false;

        const isInjected = c.id === 'injected' || c.name.toLowerCase() === 'injected';
        const hasSpecificConnectors = connectors.some(conn =>
            conn.id !== 'injected' &&
            conn.id !== 'walletConnect' &&
            !conn.name.toLowerCase().includes('injected')
        );

        if (isInjected && hasSpecificConnectors) return false;

        return true;
    });

    const popularConnectors = connectors.filter(c =>
        c.id === 'walletConnect' || c.id === 'coinbaseWallet'
    );

    const { disconnect } = useDisconnect();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    if (!mounted) return (
        <div className="w-[160px] h-11 rounded-full bg-white/5 border border-white/10 animate-pulse" />
    );

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleConnect = async (connector: Connector) => {
        console.log(`Connecting to ${connector.name} (ID: ${connector.id})...`);

        // For WalletConnect, close modal immediately to prevent z-index conflicts
        if (connector.id === 'walletConnect') {
            setIsModalOpen(false);
            // Small delay to ensure modal is fully closed before WC modal opens
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        try {
            connect({ connector });

            // For other connectors, close modal after connection starts
            if (connector.id !== 'walletConnect') {
                setTimeout(() => setIsModalOpen(false), 500);
            }
        } catch (err) {
            // Handle user rejection gracefully (when they close the modal)
            const error = err as Error;
            if (error?.message?.includes('Connection request reset') ||
                error?.message?.includes('User rejected') ||
                error?.message?.includes('User cancelled')) {
                console.log('Connection cancelled by user');
            } else {
                console.error('Connection failed:', err);
            }
            setIsModalOpen(false);
        }
    };

    const getWalletIcon = (name: string, id: string) => {
        const lower = name.toLowerCase();
        const lowerId = id.toLowerCase();

        // Define paths for user-provided images in public/images/wallets/
        if (lower.includes('metamask') || lowerId.includes('metamask')) return '/images/wallets/metamask.svg';
        if (lower.includes('phantom') || lowerId.includes('phantom')) return '/images/wallets/phantom.svg';
        if (lower.includes('keplr') || lowerId.includes('keplr')) return '/images/wallets/keplr.svg';
        if (lower.includes('compa') || lowerId.includes('compass')) return '/images/wallets/compass.png';
        if (lower.includes('coinbase') || lowerId.includes('coinbase')) return '/images/wallets/coinbase.svg';
        if (lowerId.includes('walletconnect')) return '/images/wallets/walletconnect.svg';

        return null;
    };

    const getWalletColor = (name: string, id: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('compa')) return 'bg-[#310066] text-white';
        if (lower.includes('keplr')) return 'bg-[#4B6BFF] text-white';
        if (lower.includes('phantom')) return 'bg-[#5B39A8] text-white';
        if (lower.includes('metamask')) return 'bg-[#E2761B] text-white';
        if (id === 'walletConnect') return 'bg-[#3396FF] text-white';
        if (id === 'coinbaseWallet') return 'bg-[#0052FF] text-white';
        return 'bg-slate-700 text-slate-300';
    };

    return (
        <div className="relative">
            {!isConnected ? (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-linear-to-r from-pink-500 to-cyan-500 text-white font-black hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Wallet className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 uppercase tracking-tight text-xs">Connect Wallet</span>
                </button>
            ) : (
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all shadow-inner group"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                    <span className="font-mono text-sm font-bold text-gray-200">{formatAddress(address!)}</span>
                    <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform duration-300", isMenuOpen && "rotate-180")} />
                </button>
            )}

            {/* Account Menu Popover */}
            <AnimatePresence>
                {isMenuOpen && isConnected && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-900 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-2xl"
                    >
                        <button
                            onClick={() => {
                                disconnect();
                                setIsMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Disconnect
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Connection Modal Overlay with Portal */}
            <AnimatePresence>
                {isModalOpen && (
                    <Portal>
                        <div className="fixed inset-0 z-[1000] overflow-y-auto bg-black/95 backdrop-blur-md flex justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="fixed inset-0 cursor-pointer"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl h-fit bg-[#1A1B1F] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row border border-white/10 my-auto"
                            >
                                {/* Left Side: Wallet List */}
                                <div className="flex-1 p-6 md:p-8 md:border-r border-white/5 bg-[#1A1B1F]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-white px-2">Connect a Wallet</h2>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 px-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Installed</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {installedConnectors.map((c) => {
                                                    const iconSrc = getWalletIcon(c.name, c.id);
                                                    const isMetaMask = c.name.toLowerCase().includes('metamask') || c.id.toLowerCase().includes('metamask');
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => handleConnect(c)}
                                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group lg:hover:translate-x-2"
                                                        >
                                                            <div className={clsx(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg overflow-hidden",
                                                                isMetaMask ? "bg-white" : getWalletColor(c.name, c.id)
                                                            )}>
                                                                {iconSrc ? (
                                                                    <Image src={iconSrc} alt={c.name} width={24} height={24} className="object-contain h-auto" unoptimized />
                                                                ) : (
                                                                    <Wallet className="w-5 h-5" />
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-black text-white text-sm leading-tight">{c.name}</p>
                                                                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mt-1 opacity-60">Verified</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Popular</p>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {popularConnectors.map((c) => {
                                                    const iconSrc = getWalletIcon(c.name, c.id);
                                                    const isMetaMask = c.name.toLowerCase().includes('metamask') || c.id.toLowerCase().includes('metamask');
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => handleConnect(c)}
                                                            className="flex items-center gap-4 p-4 rounded-2xl bg-transparent border border-transparent hover:bg-white/5 transition-all group lg:hover:translate-x-2"
                                                        >
                                                            <div className={clsx(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg overflow-hidden",
                                                                isMetaMask ? "bg-white" : getWalletColor(c.name, c.id)
                                                            )}>
                                                                {iconSrc ? (
                                                                    <Image src={iconSrc} alt={c.name} width={24} height={24} className="object-contain h-auto" unoptimized />
                                                                ) : (
                                                                    <Zap className="w-5 h-5" />
                                                                )}
                                                            </div>
                                                            <p className="font-black text-gray-300 group-hover:text-white transition-colors text-sm">{c.name}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Info Section */}
                                <div className="w-full md:w-[300px] p-8 md:p-10 bg-[#1F2128] flex flex-col items-center text-center justify-center">
                                    <h3 className="text-xl font-black text-white mb-10">New to Wallets?</h3>

                                    <div className="space-y-8 mb-12">
                                        <div className="flex gap-4 text-left items-start">
                                            <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg">
                                                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-base leading-tight mb-2">Home for Assets</p>
                                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Manage your digital tokens securely.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 text-left items-start">
                                            <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg">
                                                <Zap className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-base leading-tight mb-2">Log In with Crypto</p>
                                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">No accounts needed. Just connect.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <button className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-base hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30">
                                            Get a Wallet
                                        </button>
                                        <button className="text-blue-500 font-black text-[12px] uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center justify-center gap-2 mx-auto">
                                            Learn More <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </Portal>
                )}
            </AnimatePresence>
        </div>
    );
};
