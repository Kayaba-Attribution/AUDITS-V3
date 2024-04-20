{"level":"info","message":"Running main loop","timestamp":"2024-03-30T02:37:38.209Z"}
{"level":"info","message":"Manual loaded successfully","timestamp":"2024-03-30T02:37:38.213Z"}
{"level":"info","message":"[main] loaded token_address and network manually from ./AuditReport/manual.yaml","timestamp":"2024-03-30T02:37:38.214Z"}
Getting goPlusGetTokenSecurity  https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=0x57eF27273ECA2Df2e0a6a0534e12bbAa26dd315d
Log file cleared
{"level":"info","message":"[goPlusGetTokenSecurity] succesful fetch","timestamp":"2024-03-30T02:37:39.299Z"}
Getting isHoneypotTokenSecurity 
    https://api.honeypot.is/v2/IsHoneypot?address=0x57eF27273ECA2Df2e0a6a0534e12bbAa26dd315d&chainID=1
{"level":"info","message":"[isHoneypotTokenSecurity] succesful fetch","timestamp":"2024-03-30T02:37:39.590Z"}
{"level":"info","message":"[getApiReport] sucessfully retrieved api report","timestamp":"2024-03-30T02:37:39.591Z"}
{"level":"info","message":"[main] saved api report to ./AuditReport/api_report.json","timestamp":"2024-03-30T02:37:39.591Z"}
{"level":"info","message":"[main] loaded manual report from ./AuditReport/manual.yaml","timestamp":"2024-03-30T02:37:39.591Z"}
Getting getContractSourceCode  https://api.etherscan.io//api?module=contract&action=getsourcecode&address=0x57eF27273ECA2Df2e0a6a0534e12bbAa26dd315d&apikey=CYZ7EYXTR5H5Z7R5J17UAEIEFCPUJVN4KC
KEY:  SourceCode
KEY:  ABI
KEY:  ContractName
KEY:  CompilerVersion
KEY:  OptimizationUsed
KEY:  Runs
KEY:  ConstructorArguments
KEY:  EVMVersion
KEY:  Library
KEY:  LicenseType
KEY:  Proxy
KEY:  Implementation
KEY:  SwarmSource
{"level":"info","message":"[getContractSourceCode] succesful fetch","timestamp":"2024-03-30T02:37:40.003Z"}
{"level":"info","message":"[main] President PEPE (0x57ef27273eca2df2e0a6a0534e12bbaa26dd315d) saved contract to contracts/AuditContract.sol","timestamp":"2024-03-30T02:37:40.003Z"}
{"level":"info","message":"[main] loaded blockScanData from ./AuditReport/api_report.json","timestamp":"2024-03-30T02:37:40.003Z"}
UPDATE SOLC VERSION: 0.8.19
DONE
