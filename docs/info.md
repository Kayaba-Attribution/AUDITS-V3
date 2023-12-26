## Extracts function selectors from EVM bytecode, even for unverified contracts

import {functionSelectors} from 'evmole'
// Also supported: const e = require('evmole'); e.functionSelectors();

const code = '0x6080604052600436106025575f3560e01c8063b69ef8a8146029578063d0e30db014604d575b5f80fd5b3480156033575f80fd5b50603b5f5481565b60405190815260200160405180910390f35b60536055565b005b345f8082825460639190606a565b9091555050565b80820180821115608857634e487b7160e01b5f52601160045260245ffd5b9291505056fea2646970667358221220354240f63068d555e9b817619001b0dff6ea630d137edc1a640dae8e3ebb959864736f6c63430008170033'
console.log( functionSelectors(code) )

// Output(list): [ 'b69ef8a8', 'd0e30db0' ]

https://github.com/cdump/evmole#readme


https://github.com/crytic/slither/wiki/Printer-documentation

https://github.com/crytic/slither/wiki/Python-API

https://github.com/crytic/slither/wiki/Detector-Documentation