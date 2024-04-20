import fs from 'fs';
import config from './ConfigurationManager';

import { goPlusGetTokenSecurity, isHoneypotTokenSecurity, getContractSourceCode } from './api';
import { describe, expect, test } from 'bun:test';


describe("API", () => {

    test("getContractSourceCode", async () => {
        const blockScanData = await getContractSourceCode(1, "0x57eF27273ECA2Df2e0a6a0534e12bbAa26dd315d");


        expect(blockScanData).toBeDefined();
        expect(blockScanData?.SourceCode).toBeDefined();

        const code: any = blockScanData?.SourceCode
        const parsedSourceCode = JSON.parse(code)

        console.log(typeof code)

        if (blockScanData) {
            // console.log(res);
            fs.writeFileSync(config.auditContractPath, code);
        }
    }, 10000);

    test("goPlusGetTokenSecurity", async () => {
        let res = await goPlusGetTokenSecurity(56, '0x8c420a81786935DD4A90ff0B40083089Bce1535C')


        expect(res).toBeDefined();
        expect(res?.token_name).toBeDefined();

        if (res) {
            // console.log(res);
            fs.writeFileSync(config.jsonGoPlusReportPath, JSON.stringify(res, null, 2));
        }
    }, 10000);

    test("isHoneypotTokenSecurity", async () => {

        let res = await goPlusGetTokenSecurity(56, '0x8c420a81786935DD4A90ff0B40083089Bce1535C')


        let extraData = await isHoneypotTokenSecurity(56, '0x8c420a81786935DD4A90ff0B40083089Bce1535C')
        
        if (extraData) {
            // console.log(res);
            fs.writeFileSync(config.jsonHoneypotIsReportPath, JSON.stringify(extraData, null, 2));
        }

        expect(res).toBeDefined();
        expect(extraData?.token).toBeDefined();
        expect(extraData?.simulationResult).toBeDefined();



        if (res && extraData) {

            res.token_decimals = extraData.token.decimals
            res.is_openSource = extraData.contractCode.openSource
            res.pairCreatedAtTimestamp = extraData.pair.createdAtTimestamp
            res.transfer_tax = extraData.simulationResult.transferTax
            res.buy_gas = extraData.simulationResult.buyGas
            res.sell_gas = extraData.simulationResult.sellGas
            res.pairCreationTxHash = extraData.pair.creationTxHash
            res.chain = extraData.chain


            // console.log(res);
            fs.writeFileSync(config.jsonApiReportPath, JSON.stringify(res, null, 2));
        }
    }, 10000);

});
