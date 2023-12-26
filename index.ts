import figlet from "figlet";

const body = figlet.textSync("Dogecoin");

import { exec } from 'child_process';
import { readFile } from 'fs/promises';

const runSlither = async (contractPath: string, jsonOutputPath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    exec(`slither ${contractPath} --json ${jsonOutputPath}`, async (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        
        return;
      }
      try {
        const jsonOutput = await readFile(jsonOutputPath, 'utf8');
        resolve(JSON.parse(jsonOutput));
      } catch (readError) {
        reject(readError);
      }
    });
  });
};

const contractPath = './AuditContract.sol';
const jsonOutputPath = './slither_output.json';

runSlither(contractPath, jsonOutputPath)
  .then(slitherResults => {
    console.log(slitherResults); // Process slitherResults as needed
  })
  .catch(error => {
    console.error('Error running Slither:', error);
  });
