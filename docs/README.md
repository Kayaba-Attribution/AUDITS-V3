## Smart Contract Audit System Overview

This document outlines the workflow of the smart contract audit system, providing a high-level overview of each step in the pipeline and the main functions involved.

### Workflow Steps

#### 1. Initialization
- **Functionality:** Begins the audit process and logs the start.
- **Functions Used:** 
  - `logger.info('Running main loop')`

#### 2. Manual Report Loading
- **Functionality:** Loads configuration and manual report details from a YAML file.
- **Functions Used:**
  - `loadManual(config.manualReportPath)`

#### 3. API Report Generation
- **Functionality:** Fetches token security details and honeypot status from external APIs.
- **Functions Used:**
  - `getApiReport(token_address, network)` - Fetches combined token security and honeypot status.
  - Calls to:
    - `goPlusGetTokenSecurity` - Fetches token security details.
    - `isHoneypotTokenSecurity` - Determines honeypot status.

#### 4. Contract Source Code Retrieval
- **Functionality:** Retrieves the contract's source code from a blockchain explorer API.
- **Functions Used:**
  - `getContractSourceCode(network, token_address)`

#### 5. Slither Analysis
- **Functionality:** Analyzes the contract source code for vulnerabilities using Slither.
- **Functions Used:**
  - `runSlither(config.auditContractPath, config.jsonSlitherDetectorPath, true)` - Runs Slither analysis.
  - `extractDetectorResults(detectors)` - Extracts results from Slither output.
  - `populateDetectorResults(cleaned)` - Merges duplicate issues and prepares final report.

#### 6. Report Finalization
- **Functionality:** Saves the final API report, including merged manual report details and Slither analysis results, to a JSON file.
- **Functions Used:**
  - `fs.writeFileSync(config.jsonApiReportPath, JSON.stringify(apiReport, null, 2))` - Saves the final combined report.

### Additional Information

- **Manual Report Merge:** Post API report generation, the manual report details are merged into the API report, overriding any duplicates.
- **Solc Version Adjustment:** Before running Slither, the Solidity compiler version is adjusted based on the contract's compilation version.
- **Logging:** Throughout the process, various logging statements (`logger.info`, `logger.error`) are used to track the progress and note any issues encountered.
