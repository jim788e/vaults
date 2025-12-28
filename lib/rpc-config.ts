export interface RpcOption {
    name: string;
    url: string;
    isDefault?: boolean;
}

export const RPC_OPTIONS: RpcOption[] = [
    {
        name: 'Public (Default)',
        url: 'https://evm-rpc.sei-apis.com',
        isDefault: true,
    },
    {
        name: 'Pocket Network',
        url: 'https://sei.api.pocket.network',
    },
    {
        name: 'StakeMe',
        url: 'https://sei-evm-rpc.stakeme.pro',
    },
];

export const PREFERRED_RPC_KEY = 'preferred_rpc_url';
