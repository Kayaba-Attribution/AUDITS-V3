
import type { Chain } from './GoPlusTypes.ts'
export interface HoneypotTokenResponse {
    token: {
        name: string;
        symbol: string;
        decimals: number;
        address: string;
        totalHolders: number;
        airdropSummary?: {
            totalTxs: number;
            totalAmountWei: string;
            totalTransfers: number;
        };
    };
    withToken: {
        name: string;
        symbol: string;
        decimals: number;
        address: string;
        totalHolders: number;
    };
    summary: {
        risk: string;
        riskLevel: number;
        flags: Array<{
            flag: string;
            description: string;
            severity: string;
            severityIndex: number;
        }>;
    };
    simulationSuccess: boolean;
    honeypotResult: {
        isHoneypot: boolean;
    };
    simulationResult: {
        buyTax: number;
        sellTax: number;
        transferTax: number;
        buyGas: string;
        sellGas: string;
    };
    holderAnalysis?: {
        holders: string;
        successful: string;
        failed: string;
        siphoned: string;
        averageTax: number;
        averageGas: number;
        highestTax: number;
        highTaxWallets: string;
        taxDistribution: Array<{
            tax: number;
            count: number;
        }>;
        snipersFailed: number;
        snipersSuccess: number;
    };
    flags: string[];
    contractCode: {
        openSource: boolean;
        rootOpenSource?: boolean;
        isProxy: boolean;
        hasProxyCalls?: boolean;
    };
    chain: Chain; // Using the existing Chain type from TokenInfo
    router: string;
    pair: {
        pair: {
            name: string;
            address: string;
            token0: string;
            token1: string;
            type: string;
        };
        chainId: string;
        reserves0: string;
        reserves1: string;
        liquidity: number;
        router: string;
        createdAtTimestamp: string;
        creationTxHash: string;
    };
    pairAddress: string;
}
