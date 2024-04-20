// ContractAnalyzer.test.ts
import { runSlither, loadSlitherOutput, extractDetectorResults, populateDetectorResults, runSlitherGetModifiers, extractModifiers,
runSurya,
runSlitherInheritance } from './ContractAnalyzer';

import fs from 'fs';


import config from './ConfigurationManager';
import type { Detector } from './types/SlitherTypes';


import { test, expect, mock, describe } from "bun:test";
import logger from './logger';
import { Result } from 'ethers';

describe("ContractAnalyzer", () => {
    test("Slither_run_save_return_json", async () => {
        const slitherResults = await runSlither(
            config.testContractPath,
            config.jsonSlitherDetectorPath);


        const { results, success, error } = slitherResults;

        expect(slitherResults).toBeDefined();
        expect(results).toBeDefined();
        expect(success).toBe(true);
        expect(error).toBe(null);

        console.log("Slither Found " + results.detectors.length + " issues");

    }, 10000);

    test('Extract Detector Results', async () => {
        const detectors: Detector[] = await loadSlitherOutput(config.jsonSlitherDetectorPath, true);

        // Ensure data is defined and has the expected structure

        expect(detectors).toBeDefined();
        expect(detectors.length).toBeGreaterThan(0);

        const cleaned = await extractDetectorResults(detectors);

        expect(cleaned).toBeDefined();
        expect(Object.keys(cleaned).length).toBeGreaterThan(0);

        const cleanedWithMetadata = await populateDetectorResults(cleaned);
        
        fs.writeFileSync(config.jsonCleanDetectorPath, JSON.stringify(cleanedWithMetadata, null, 2));
    });

    test("Extract and parseModifiers", async () => {
        const modifierPrinterData = await runSlitherGetModifiers(config.testContractPath, config.jsonSlitherModifiersPath)
        console.log("modifierPrinterData", modifierPrinterData ? true : false)

        const cleanedMod = extractModifiers(modifierPrinterData)
        console.log(cleanedMod)
    })

    test("Surya Test Inheritance and graph images", async() => {
        await runSurya("inheritance", config.testContractPath, config.suryaInheritancePath)

        await runSurya("graph", config.testContractPath, config.suryaGraphPath)

        await runSlitherInheritance(config.testContractPath, config.slitherInheritancePath, "TestContract")
    })

});