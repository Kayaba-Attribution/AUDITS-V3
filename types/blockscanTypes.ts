
export type ContractDetails = {
    SourceCode: string;
    ABI: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string | number; // If this is always a string that represents a number, you can use just string
    Runs: string | number; // Same here, depends on if you expect a number or string from your data source
    ConstructorArguments: string;
    EVMVersion: string;
    Library: string;
    LicenseType: string;
    Proxy: string | number; // Assuming "0" represents a boolean false, you might want to use `boolean` or `0 | 1`
    Implementation: string;
    SwarmSource: string;
};