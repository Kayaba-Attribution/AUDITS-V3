import { log } from 'winston';
import logger from './logger';
import config from './ConfigurationManager';
import fs from 'fs';

import { runSlither, changeSolcVersion, extractDetectorResults, populateDetectorResults } from './ContractAnalyzer';

import { getApiReport } from './api';

import type { Detector } from './types/SlitherTypes';

import { loadManual } from './utils/pdfMakerUtils';

import { getContractSourceCode } from "./api";

async function main() {

    logger.info('Running main loop')

    // ? load maual report

    type Manual = {
        token_address: string;
        network: number;
        imageName: string;
        url: string;
        telegram: string;
        description: string;
        type: string;
    };

    // Assuming `loadManual` is defined in the same way as previously
    const manual = loadManual(config.manualReportPath) as unknown as Manual

    const token_address: string = manual.token_address;
    const network: number = manual.network;

    if (!token_address || !network) {
        logger.error('[main] token_address or network not found in manual report');
        return;
    }

    logger.info('[main] loaded token_address and network manually from ' + config.manualReportPath);


    // ? API CALLS FOR TOKEN

    const apiReport = await getApiReport(token_address, network);

    logger.info('[main] saved api report to ' + config.jsonApiReportPath);

    if (manual) {

        // itereate over manual and add to apiReport

        apiReport.imageName = manual.imageName;
        apiReport.url = manual.url;
        apiReport.telegram = manual.telegram;
        apiReport.description = manual.description;
        apiReport.type = manual.type;

        logger.info('[main] loaded manual report from ' + config.manualReportPath);
    }

    const pdfDataDisplay = {
        pairCreationTxHash: apiReport.pairCreationTxHash,
        
    };

    // ? get Contract info and loaded to json

    const blockScanData = await getContractSourceCode(network, token_address);

    if (blockScanData && blockScanData?.SourceCode !== '') {
        // save to config.auditContractPath
        fs.writeFileSync(config.auditContractPath, blockScanData.SourceCode);
        logger.info(`[main] ${apiReport.token_name} (${apiReport.contract_address}) saved contract to ` + config.auditContractPath);
    } else {
        logger.error(`[main] ${apiReport.token_name} (${apiReport.contract_address}) contract not found`);
        return;
    }
    apiReport.blockScanData = blockScanData;
    delete apiReport.blockScanData.SourceCode;
    delete apiReport.blockScanData.ABI;

    logger.info('[main] loaded blockScanData from ' + config.manualReportPath);

    // ? ONLY SLITHER DETECTORS

    if( blockScanData) {
        let solcVersion = blockScanData.CompilerVersion.replace('v', '');
        // remove +commit.27d51765 from solc version
        solcVersion = solcVersion.split('+')[0];
        await changeSolcVersion(solcVersion);
    }

    const detectors: Detector[] = await runSlither(
        config.auditContractPath,
        config.jsonSlitherDetectorPath, true);

    const cleaned = await extractDetectorResults(detectors);

    const cleanedWithMetadata = await populateDetectorResults(cleaned);

    fs.writeFileSync(config.jsonCleanDetectorPath, JSON.stringify(cleanedWithMetadata, null, 2));

    logger.info('[main] saved clean detector results to ' + config.jsonCleanDetectorPath);


    // final save
    fs.writeFileSync(config.jsonApiReportPath, JSON.stringify(apiReport, null, 2));
    logger.info('[main] saved api report to ' + config.jsonApiReportPath);



}


await main();