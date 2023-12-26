import { functionSelectors } from 'evmole'
import { lookupSignatureOpenChain } from '../api'

// https://api.openchain.xyz/signature-database/v1/lookup?filter=true

export const getFunctionSelectors = async (code: string) => {
    let selectors_list: string[] = functionSelectors(code);

    selectors_list = selectors_list.map((selector) => {
        return "0x" + selector;
    });

    let functions = await lookupSignatureOpenChain(selectors_list);

    return functions;
}

// let a = await getFunctionSelectors(code)
// console.log(a)
// https://api.openchain.xyz/signature-database/v1/function?filter=0xb69ef8a8%2C0xd0e30db0&filter=true
