export interface RpcStatus {
    latency: number;
    blockHeight: number;
    color: 'green' | 'yellow' | 'red';
    status: 'Good' | 'Fair' | 'Poor';
}

/**
 * Checks the status of an RPC endpoint by calling eth_blockNumber
 * and measuring the latency.
 */
export async function checkRpcStatus(url: string): Promise<RpcStatus> {
    const start = performance.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const cleanUrl = url.trim().replace(/\/+$/, '');
        const response = await fetch(cleanUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('RPC error');

        const data = await response.json();
        const latency = Math.round(performance.now() - start);
        const blockHeight = parseInt(data.result, 16);

        let color: 'green' | 'yellow' | 'red' = 'green';
        let status: 'Good' | 'Fair' | 'Poor' = 'Good';

        if (latency > 1500) {
            color = 'red';
            status = 'Poor';
        } else if (latency > 500) {
            color = 'yellow';
            status = 'Fair';
        }

        return { latency, blockHeight, color, status };
    } catch (error) {
        console.error(`Error checking RPC ${url}:`, error);
        return {
            latency: 0,
            blockHeight: 0,
            color: 'red',
            status: 'Poor',
        };
    }
}
