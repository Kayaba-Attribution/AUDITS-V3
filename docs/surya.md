surya inheritance contracts/TestContract.sol -i | dot -Tpng > MyContract.png

surya graph contracts/\*_/_.sol | dot -Tpng > MyContract.png -s

surya mdreport report_outfile.md contracts/TestContract.sol

surya describe contracts/TestContract.sol