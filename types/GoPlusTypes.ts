interface DexInfo {
    liquidity_type: string;
    name: string;
    liquidity: string;
    pair: string;
    token0: string;
    token1: string;
    reserve0: number;
    reserve1: number;
}

export interface Holder {
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
    decimals: string;
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
