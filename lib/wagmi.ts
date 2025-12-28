import { http, createConfig } from 'wagmi';
import { sei } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { PREFERRED_RPC_KEY } from './rpc-config';

// Get initial RPC from localStorage (client-side only)
const getInitialRpc = () => {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem(PREFERRED_RPC_KEY) || undefined;
};

export const config = createConfig({
    chains: [sei],
    connectors: [
        injected(),
        coinbaseWallet(),
        walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' }),
    ],
    transports: {
        [sei.id]: http(getInitialRpc()),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}

