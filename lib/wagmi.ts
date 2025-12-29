import { http, createConfig, fallback } from 'wagmi';
import { sei } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { PREFERRED_RPC_KEY } from './rpc-config';

// Get initial RPC from localStorage (client-side only)
const getInitialRpc = () => {
    if (typeof window === 'undefined') return undefined;
    const rpc = localStorage.getItem(PREFERRED_RPC_KEY);
    if (!rpc) return undefined;

    // Clean the URL: trim whitespace and remove trailing slashes
    return rpc.trim().replace(/\/+$/, '') || undefined;
};

export const config = createConfig({
    chains: [sei],
    connectors: [
        injected(),
        coinbaseWallet(),
        walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' }),
    ],
    transports: {
        [sei.id]: fallback([
            http(getInitialRpc()),
            http('https://sei-evm-rpc.publicnode.com'),
            http('https://sei.api.pocket.network'),
            http('https://evm-rpc.sei-apis.com'),
        ]),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}

