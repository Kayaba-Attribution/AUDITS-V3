import { readFile } from 'fs/promises';
import { unlink } from 'fs/promises';
import { exec } from 'child_process';
import logger from './logger';
import fs from 'fs';
import config from './ConfigurationManager';

// types
import { SlitherOutput, Detector, SourceMapping } from './types/SlitherTypes';
import { DetectorResult } from './types/DetectorTypes';


const extractSourceText = async (sourceMapping: SourceMapping): Promise<string> => {
    try {
        if (!sourceMapping) {
            throw new Error('No sourceMapping provided');
        }
        const fileContent = await readFile(sourceMapping.filename_relative, 'utf8');
        const lines = fileContent.split('\n');
        return sourceMapping.lines
            .filter(line => {
                if (line <= 0 || line > lines.length) {
                    console.log(`Skipping line: ${line}`);
                    return false;
                }
                return true;
            })
            .map(line => lines[line - 1].slice(sourceMapping.startingColumn - 1, sourceMapping.endingColumn))
            .join('\n');
    } catch (error) {
        throw new Error(`Error reading file: ${error}`);
    }
};


export const loadSlitherOutput = async (jsonOutputPath: string, onlyDetectors?: boolean): Promise<SlitherOutput | Detector[] | any> => {
    try {
        // read the json output
        const jsonOutput = await readFile(jsonOutputPath, 'utf8');
        // return the parsed json
        const parsedJsonOutput: SlitherOutput = JSON.parse(jsonOutput);

        if (onlyDetectors) {
            if (!parsedJsonOutput || !parsedJsonOutput.results || !parsedJsonOutput.results) {
                logger.error(`[loadSlitherOutput] Invalid data structure received from loadSlitherOutput`);
                throw new Error('Invalid data structure received from loadSlitherOutput');
            }
            const { detectors } = parsedJsonOutput.results;
            return detectors;
        } else {
            return parsedJsonOutput;
        }
    } catch (readError) {
        logger.error(`[loadSlitherOutput] readFile jsonOutputPath error at ${jsonOutputPath}`, readError);
        return readError;
    }
}

export const extractDetectorResults = async (detectors: Detector[]): Promise<Record<number, DetectorResult>> => {
    let detectorResults: Record<number, DetectorResult> = {};
    let counter = 0;
    for (const detector of detectors) {
        const { description, check, impact, confidence, elements } = detector;
        let findType = "";
        let sourceTest = "";
        let lines: number[] = [];
        if (elements.length > 0) {
            findType = elements[0].type;
            sourceTest = await extractSourceText(elements[0].source_mapping);
            // remove all empty spaces at the beggining and end of the string
            sourceTest = sourceTest.trim();
            lines = elements[0].source_mapping.lines;
            // Do something with sourceTest if needed
        }
        detectorResults[counter] = {
            findType,
            title: description,
            check,
            impact,
            confidence,
            sourceTest,
            lines
        };
        counter++;
    }

    logger.info(`[extractDetectorResults] Found ${counter} issues`);

    return detectorResults;
};

export const populateDetectorResults = async (detectorResults: Record<string, DetectorResult>): Promise<Record<number, DetectorResult>> => {
    // Assuming vulnerabilitiesInfo is the JSON object read from the file
    const vulnerabilitiesInfo = JSON.parse(fs.readFileSync(config.vulnerabilitiesInfoPath, 'utf8'));

    for (const key in detectorResults) {
        const check = detectorResults[key].check;
        if (vulnerabilitiesInfo.hasOwnProperty(check)) {
            detectorResults[key] = {
                ...detectorResults[key],
                name: vulnerabilitiesInfo[check].name,
                exploit: vulnerabilitiesInfo[check].exploit,
                description: vulnerabilitiesInfo[check].description,
                recommendation: vulnerabilitiesInfo[check].recommendation,
                explanation: vulnerabilitiesInfo[check].explanation,
            };
        }
    }

    // check for duplicates and merge name and sourceTest
    let resultsNoDuplicates: Record<string, DetectorResult> = {};

    for (const find in detectorResults) {
        let name = detectorResults[find].name;
        if (name === undefined) name = "Error: No name found";

        if (resultsNoDuplicates[name]) {
            resultsNoDuplicates[name].numberOfDuplicates = (resultsNoDuplicates[name].numberOfDuplicates ?? 0) + 1;
            resultsNoDuplicates[name].title += "\n" + detectorResults[find].title;
            resultsNoDuplicates[name].lines = resultsNoDuplicates[name].lines.concat(detectorResults[find].lines);
            resultsNoDuplicates[name].sourceTest += "\n" + detectorResults[find].sourceTest;
        } else {
            resultsNoDuplicates[name] = {
                numberOfDuplicates: 0,
                ...detectorResults[find]
            };
        }
    }

    logger.info(`[populateDetectorResults] Found ${Object.keys(resultsNoDuplicates).length} issues after merging duplicates`);

    return resultsNoDuplicates;
};

export const changeSolcVersion = async (solcVersion: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // execute slither and save to json
        exec(`solc-select use ${solcVersion} --always-install`, async (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }

            if (stderr) {
                reject();
            }
            resolve();
        });
    });
}


export const runSlither = async (contractPath: string, jsonOutputPath: string, onlyDetectors?: boolean): Promise<SlitherOutput | Detector[] | any> => {
    try {
        await unlink(jsonOutputPath); // Delete the file if it exists
    } catch (err: any) {
        // Only log error if it's not about the file's non-existence
        if (err.code !== 'ENOENT') {
            logger.error("[runSlither] unlink jsonOutputPath error:", err);
        }
    }

    return new Promise((resolve, reject) => {
        // execute slither and save to json
        exec(`slither ${contractPath} --exclude naming-convention,unused-state,reentrancy-eth,reentrancy-benign,similar-names --json ${jsonOutputPath}`, async (error, stdout, stderr) => {
            if (error) {
                // workaround for slither returning 255 when it finds issues
                if (error.code === 255) {
                    try {
                        if (onlyDetectors) {
                            const detectors: Detector[] = await loadSlitherOutput(jsonOutputPath, true);
                            resolve(detectors);
                            logger.info(`[runSlither] Slither run successfully for ${contractPath} saved to ${jsonOutputPath}`);
                            return;
                        }
                        // return the parsed json
                        const parsedJsonOutput: SlitherOutput | any = loadSlitherOutput(jsonOutputPath);
                        resolve(parsedJsonOutput);
                        logger.info(`[runSlither] Slither run successfully for ${contractPath} saved to ${jsonOutputPath}`);
                    } catch (readError) {
                        logger.error("[runSlither] readFile jsonOutputPath error:", readError);
                        reject(readError);
                    }
                }
                reject(error.message);
                return;
            }

            if (stderr) {
                reject();
            }

        });
    });
};



