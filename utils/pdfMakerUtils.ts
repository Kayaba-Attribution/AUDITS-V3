import fs from 'fs';
import yaml from 'js-yaml';
import logger from '../logger';
import config from '../ConfigurationManager';
import { Holder } from '../types/GoPlusTypes';

export function loadManual(manualFileName: string) {
    try {
        const manualData = fs.readFileSync(manualFileName, 'utf8');
        const manualObject = yaml.load(manualData);
        logger.info('Manual loaded successfully');
        return manualObject;
    } catch (error) {
        logger.error(`Error loading manual: ${error}`);
        return null;
    }
}

export function getBlockScannerUrl(chain: number ) : string[] {
    let url = '';
    let key = '';
    switch (chain) {
        case 1:
            url = `https://etherscan.io/`;
            key = config.etherscanApiKey;
            break;
        case 56:
            url = `https://bscscan.com/`;
            key = config.bscscanApiKey;
            break;
        case 137:
            url = `https://polygonscan.com/`;
            key = config.polygonscanApiKey;
            break;
        case 250:
            url = `https://ftmscan.com/`;
            key = config.ftmscanApiKey;
            break;
        default:
            url = '';
    }
    return [url, key];
}

type top10Data = {
    totalAmount: number,
    totalPercentages: number,
    totalLocked: number,
    percentageLocked: number,
}

export function getTop10Data(holders: Holder[]): top10Data {
    // iterate over holders and sum all their balances and percentages
    let top10Data = {
        totalAmount: 0,
        totalPercentages: 0,
        totalLocked: 0,
        percentageLocked: 0,
    };

    for (let i = 0; i < 10; i++) {
        if (holders[i]) {
            top10Data.totalAmount += parseInt(holders[i].balance);
            top10Data.totalPercentages += parseFloat(holders[i].percent);
            if (holders[i].is_locked == 1) {
                top10Data.totalLocked += parseInt(holders[i].balance);
                top10Data.percentageLocked += parseFloat(holders[i].percent);
            }
        }
    }

    return top10Data;
}

export function roundToNearestHundredth(num: number | string): number {
    if (typeof num === 'string') {
        num = parseFloat(num);
    }
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function parseNumber(num: number): string {
    return num.toLocaleString('en-US');
}

// loadManual('../AuditReport/manual.yalm')