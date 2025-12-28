'use client';

import Image from 'next/image';
import { WalletConnect } from './WalletConnect';
import { RpcSelector } from './RpcSelector';

export const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                        <Image
                            src="/images/CCL_logo.svg"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent hidden sm:block">
                        Riverchurn Reserve
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <RpcSelector />
                    <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
                    <WalletConnect />
                </div>
            </div>
        </header>
    );
};
