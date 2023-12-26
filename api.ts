import retry from 'async-retry';
import axios from 'axios';
import { GoPlusResponse, TokenInfo } from './types/GoPlusTypes';
import { ContractDetails } from './types/blockscanTypes';
import logger from './logger';
import { getBlockScannerUrl } from './utils/pdfMakerUtils';

export async function lookupSignatureOpenChain(signatures: string[]): Promise<any> {

    const signature = signatures.join('%2C');
    console.log('Looking up signature', signature);
    const url = `https://api.openchain.xyz/signature-database/v1/lookup?function=${signature}&filter=true`;
    console.log(url);

    try {
        const result = await retry(
            async () => {
                const response = await axios.get(url);

                if (!response.data) {
                    console.log('Might be hitting the rate limit, try again', signature);
                    throw new Error('Request failed');
                }

                return response.data.result.function;
            },
            {
                retries: 5,
            }
        );

        return result;
    } catch (error) {
        console.log('Error looking up signature', error);
        return null;
    }
}

export async function goPlusGetTokenSecurity(chain: number, contractAddress: string): Promise<TokenInfo | null> {
    const url = `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${contractAddress}`;

    console.log('Getting goPlusGetTokenSecurity ', url);

    try {
        const result = await retry(
            async () => {
                const response = await axios.get<GoPlusResponse>(url);

                if (!response.data) {
                    console.log('Might be hitting the rate limit, try again', contractAddress);
                    throw new Error('Request failed');
                }

                let ca = Object.keys(response.data.result)[0]
                let tokenInfo = response.data.result
                tokenInfo[ca].contract_address = ca

                return tokenInfo[ca];
            },
            {
                retries: 5,
            }
        );

        return result;
    } catch (error) {
        console.log('Error getting token security', error);
        return null;
    }
}

export async function getContractSourceCode(chain: number, contractAddress: string): Promise<ContractDetails | null> {
    let [scanner, key] = getBlockScannerUrl(chain);

    scanner = scanner.replace('https://', '')
    const url = `https://api.${scanner}/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${key}.json`;

    console.log('Getting getContractSourceCode ', url);

    try {
        const result = await retry(
            async () => {
                const response = await axios.get<any>(url);

                if (!response.data) {
                    console.log('Might be hitting the rate limit, try again', contractAddress);
                    throw new Error('Request failed');
                }

                if (response.data.status === '0') {
                    logger.error('!! [getContractSourceCode] status 0 response', contractAddress);
                    return null;
                }

                const data: ContractDetails = response.data.result[0];

                if (data.SourceCode === '') {
                    logger.error('!! [getContractSourceCode] no source code result found', contractAddress);
                    return data;
                }

                return data;
            },
            {
                retries: 5,
            }
        );

        return result;
    } catch (error) {
        console.log('Error getting token security', error);
        return null;
    }
}

export async function isHoneypotTokenSecurity(chain: number, contractAddress: string): Promise<any | null> {
    const url = `
    https://api.honeypot.is/v2/IsHoneypot?address=${contractAddress}&chainID=${chain}`

    console.log('Getting isHoneypotTokenSecurity', url);

    try {
        const result = await retry(
            async () => {
                const response = await axios.get<any>(url);

                if (!response.data) {
                    console.log('Might be hitting the rate limit, try again', contractAddress);
                    throw new Error('Request failed');
                }

                return response.data;
            },
            {
                retries: 5,
            }
        );

        return result;
    } catch (error) {
        console.log('Error getting token security', error);
        return null;
    }
}


export async function getApiReport(contractAddress: string, chain: number): Promise<any | null> {
    const res = await goPlusGetTokenSecurity(chain, contractAddress)

    const extraData = await isHoneypotTokenSecurity(chain, contractAddress)


    if (res && extraData) {

        res.token_decimals = extraData.token.decimals
        res.pairCreatedAtTimestamp = extraData.pair.createdAtTimestamp
        res.transfer_tax = extraData.simulationResult.transferTax
        res.buy_gas = extraData.simulationResult.buyGas
        res.sell_gas = extraData.simulationResult.sellGas
        res.pairCreationTxHash = extraData.pair.creationTxHash
        res.chain = extraData.chain

        res.dex[0].token0 = extraData.pair.pair.token0
        res.dex[0].token1 = extraData.pair.pair.token1
        res.chain.decimals = extraData.withToken.decimals

        const tokenDecimals = res.token_decimals ?? '0';
        if (tokenDecimals === '0') {
            logger.error('[getApiReport] token_decimals is 0');
            return null;
        }

        const isToken0ContractAddress = res.contract_address.toLowerCase() === res.dex[0].token0.toLowerCase();

        res.dex[0].reserve0 = extraData.pair[isToken0ContractAddress ? 'reserves0' : 'reserves1'] / (10 ** parseInt(tokenDecimals));
        res.dex[0].reserve1 = extraData.pair[isToken0ContractAddress ? 'reserves1' : 'reserves0'] / (10 ** parseInt(res.chain.decimals));


    }

    logger.info('[getApiReport] sucessfully retrieved api report');
    return res;
}



