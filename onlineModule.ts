import retry from 'async-retry';
import axios from 'axios';

interface DexInfo {
    liquidity_type: string;
    name: string;
    liquidity: string;
    pair: string;
}

interface Holder {
    address: string;
    tag: string;
    is_contract: number;
    balance: string;
    percent: string;
    is_locked: number;
    locked_detail?: LockedDetail[];
}

interface LockedDetail {
    amount: string;
    end_time: string;
    opt_time: string;
}

interface Chain {
    id: string;
    name: string;
    shortName: string;
    currency: string;
}

export interface TokenInfo {
    // Trading
    buy_tax: string;
    sell_tax: string;
    cannot_buy?: string;
    cannot_sell_all?: string;
    trading_cooldown?: string;

    is_honeypot?: string;
    honeypot_with_same_creator: string;

    slippage_modifiable?: string; // tax_modifiable
    personal_slippage_modifiable?: string;

    // Custom Functions
    gas_abuse?: string;
    selfdestruct?: string;
    is_mintable?: string;
    is_anti_whale?: string;
    is_blacklisted?: string;
    is_whitelisted?: string;
    hidden_owner?: string;
    anti_whale_modifiable?: string;
    can_take_back_ownership?: string;

    // Very Bad
    external_call?: string;
    transfer_pausable?: string;

    // Addresses & Balances
    creator_address: string;
    creator_balance: string;
    creator_percent: string;
    owner_address: string;
    owner_balance?: string;
    owner_percent?: string;
    owner_change_balance?: string;
    lp_holder_count?: string;
    lp_total_supply?: string;
    lp_holders?: Holder[];

    // Metadata
    contract_address: string;
    token_name: string;
    token_symbol: string;
    total_supply: string;
    dex: DexInfo[];
    holder_count: string;
    holders: Holder[];
    is_in_dex: string;
    is_open_source: string;
    is_proxy?: string;


    // isHoneypot
    token_decimals?: string;
    is_openSource?: string;
    pairCreatedAtTimestamp?: string;
    pairCreationTxHash?: string;
    transfer_tax?: string;
    buy_gas?: string;
    sell_gas?: string;
    chain: Chain;

    // Other
    is_true_token?: string;
    is_airdrop_scam?: string;
    trust_list?: string;
    other_potential_risks?: string;
    note?: string;
}

export interface GoPlusResponse {
    code: number;
    message: string;
    result: { [key: string]: TokenInfo };
}

interface DexInfo {
    liquidity_type: string;
    name: string;
    liquidity: string;
    pair: string;
}

interface Holder {
    address: string;
    tag: string;
    is_contract: number;
    balance: string;
    percent: string;
    is_locked: number;
    locked_detail?: LockedDetail[];
}

interface LockedDetail {
    amount: string;
    end_time: string;
    opt_time: string;
}

interface Chain {
    id: string;
    name: string;
    shortName: string;
    currency: string;
}

export interface TokenInfo {
    // Trading
    buy_tax: string;
    sell_tax: string;
    cannot_buy?: string;
    cannot_sell_all?: string;
    trading_cooldown?: string;

    is_honeypot?: string;
    honeypot_with_same_creator: string;

    slippage_modifiable?: string; // tax_modifiable
    personal_slippage_modifiable?: string;

    // Custom Functions
    gas_abuse?: string;
    selfdestruct?: string;
    is_mintable?: string;
    is_anti_whale?: string;
    is_blacklisted?: string;
    is_whitelisted?: string;
    hidden_owner?: string;
    anti_whale_modifiable?: string;
    can_take_back_ownership?: string;

    // Very Bad
    external_call?: string;
    transfer_pausable?: string;

    // Addresses & Balances
    creator_address: string;
    creator_balance: string;
    creator_percent: string;
    owner_address: string;
    owner_balance?: string;
    owner_percent?: string;
    owner_change_balance?: string;
    lp_holder_count?: string;
    lp_total_supply?: string;
    lp_holders?: Holder[];

    // Metadata
    contract_address: string;
    token_name: string;
    token_symbol: string;
    total_supply: string;
    dex: DexInfo[];
    holder_count: string;
    holders: Holder[];
    is_in_dex: string;
    is_open_source: string;
    is_proxy?: string;


    // isHoneypot
    token_decimals?: string;
    is_openSource?: string;
    pairCreatedAtTimestamp?: string;
    pairCreationTxHash?: string;
    transfer_tax?: string;
    buy_gas?: string;
    sell_gas?: string;
    chain: Chain;

    // Other
    is_true_token?: string;
    is_airdrop_scam?: string;
    trust_list?: string;
    other_potential_risks?: string;
    note?: string;
}

export interface GoPlusResponse {
    code: number;
    message: string;
    result: { [key: string]: TokenInfo };
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

export async function getReport(contractAddress: string, chain: number): Promise<any | null> {
    let res = await goPlusGetTokenSecurity(chain, contractAddress)

    let extraData = await isHoneypotTokenSecurity(chain, contractAddress)


    if (res && extraData) {

        res.token_decimals = extraData.token.decimals
        res.is_openSource = extraData.contractCode.openSource
        res.pairCreatedAtTimestamp = extraData.pair.createdAtTimestamp
        res.transfer_tax = extraData.simulationResult.transferTax
        res.buy_gas = extraData.simulationResult.buyGas
        res.sell_gas = extraData.simulationResult.sellGas
        res.pairCreationTxHash = extraData.pair.creationTxHash
        res.chain = extraData.chain


        console.log(res);
    }

}
