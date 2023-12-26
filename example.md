Log file cleared
{"level":"info","message":"[runSlither] Slither found issues for contracts/TestContract.sol","timestamp":"2023-11-30T22:03:23.927Z"}
{"level":"info","message":"[runSlither] Slither run successfully for contracts/TestContract.sol saved to ./slither_output.json","timestamp":"2023-11-30T22:03:23.929Z"}
36
36
{
  "306a8b4777fc23b5b90b01f4b9317967b4def615dd7b862c18c2472503c3c6d1": {
    typeAndName: "function claimStuckTokens",
    description: "XTwitter.claimStuckTokens(address) (contracts/TestContract.sol#757-765) ignores return value by ERC20token.transfer(msg.sender,balance) (contracts/TestContract.sol#764)\n",
    check: "unchecked-transfer",
    impact: "High",
    confidence: "Medium",
    sourceTest: "    function claimStuckTokens(address token) external onlyOwner {\r\n        if (token == address(0x0)) {\r\n            payable(msg.sender).transfer(address(this).balance);\r\n            return;\r\n        }\r\n        IERC20 ERC20token = IERC20(token);\r\n        uint256 balance = ERC20token.balanceOf(address(this));\r\n        ERC20token.transfer(msg.sender, balance);\r\n    }\r",
    lines: [ 757, 758, 759, 760, 761, 762, 763, 764, 765 ]
  },
  "5ea2b61d70f80404b1c1ddeb3da811551bdabc8ba7bec5b0e31868de64069ba4": {
    typeAndName: "function _transfer",
    description: "Reentrancy in XTwitter._transfer(address,address,uint256) (contracts/TestContract.sol#804-867):\n\tExternal calls:\n\t- uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(contractTokenBalance,0,path,address(marketingWallet),block.timestamp) (contracts/TestContract.sol#835-842)\n\tState variables written after the call(s):\n\t- super._transfer(from,address(this),fees) (contracts/TestContract.sol#863)\n\t\t- _balances[sender] = _balances[sender].sub(amount,ERC20: transfer amount exceeds balance) (contracts/TestContract.sol#652-655)\n\t\t- _balances[recipient] = _balances[recipient].add(amount) (contracts/TestContract.sol#656)\n\tERC20._balances (contracts/TestContract.sol#543) can be used in cross function reentrancies:\n\t- ERC20._mint(address,uint256) (contracts/TestContract.sol#660-666)\n\t- ERC20._transfer(address,address,uint256) (contracts/TestContract.sol#644-658)\n\t- ERC20.balanceOf(address) (contracts/TestContract.sol#571-575)\n\t- super._transfer(from,to,amount) (contracts/TestContract.sol#866)\n\t\t- _balances[sender] = _balances[sender].sub(amount,ERC20: transfer amount exceeds balance) (contracts/TestContract.sol#652-655)\n\t\t- _balances[recipient] = _balances[recipient].add(amount) (contracts/TestContract.sol#656)\n\tERC20._balances (contracts/TestContract.sol#543) can be used in cross function reentrancies:\n\t- ERC20._mint(address,uint256) (contracts/TestContract.sol#660-666)\n\t- ERC20._transfer(address,address,uint256) (contracts/TestContract.sol#644-658)\n\t- ERC20.balanceOf(address) (contracts/TestContract.sol#571-575)\n\t- swapping = false (contracts/TestContract.sol#845)\n\tXTwitter.swapping (contracts/TestContract.sol#710) can be used in cross function reentrancies:\n\t- XTwitter._transfer(address,address,uint256) (contracts/TestContract.sol#804-867)\n",
    check: "reentrancy-no-eth",
    impact: "Medium",
    confidence: "Medium",
    sourceTest: "    function _transfer(\r\n        address from,\r\n        address to,\r\n        uint256 amount\r\n    ) internal override {\r\n        require(from != address(0), \"ERC20: transfer from the zero address\");\r\n        require(to != address(0), \"ERC20: transfer to the zero address\");\r\n        require(\r\n            tradingEnabled ||\r\n                _isExcludedFromFees[from] ||\r\n                _isExcludedFromFees[to],\r\n            \"ERC20: trading is disabled\"\r\n        );\r\n\r\n        if (amount == 0) {\r\n            super._transfer(from, to, 0);\r\n            return;\r\n        }\r\n\r\n        uint256 contractTokenBalance = balanceOf(address(this));\r\n\r\n        bool canSwap = contractTokenBalance >= swapTokensAtAmount;\r\n\r\n        if (canSwap && !swapping && to == uniswapV2Pair) {\r\n            swapping = true;\r\n\r\n            if (contractTokenBalance > 0) {\r\n                address[] memory path = new address[](2);\r\n                path[0] = address(this);\r\n                path[1] = uniswapV2Router.WETH();\r\n\r\n                uniswapV2Router\r\n                    .swapExactTokensForETHSupportingFeeOnTransferTokens(\r\n                        contractTokenBalance,\r\n                        0,\r\n                        path,\r\n                        address(marketingWallet),\r\n                        block.timestamp\r\n                    );\r\n            }\r\n\r\n            swapping = false;\r\n        }\r\n\r\n        uint256 _totalFees;\r\n        if (\r\n            ((_isExcludedFromFees[from] || _isExcludedFromFees[to]) ||\r\n                (from != uniswapV2Pair && to != uniswapV2Pair)) || swapping\r\n        ) {\r\n            _totalFees = 0;\r\n        } else if (from == uniswapV2Pair) {\r\n            _totalFees = block.number <= antiBotBlockEnd ? 25 : 0;\r\n        } else {\r\n            _totalFees = block.number <= antiBotBlockEnd ? 25 : 4;\r\n        }\r\n\r\n        if (_totalFees > 0) {\r\n            uint256 fees = (amount * _totalFees) / 100;\r\n            amount = amount - fees;\r\n            super._transfer(from, address(this), fees);\r\n        }\r\n\r\n        super._transfer(from, to, amount);\r\n    }\r",
    lines: [ 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821,
      822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840,
      841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859,
      860, 861, 862, 863, 864, 865, 866, 867 ]
  },
  "28e7ed2a0aabc4ebba8d5e1717fa63be7343d0cdd23182c805b0a9f592117534": {
    typeAndName: "variable router",
    description: "XTwitter.constructor().router (contracts/TestContract.sol#729) is a local variable never initialized\n",
    check: "uninitialized-local",
    impact: "Medium",
    confidence: "Medium",
    sourceTest: "        address router;\r",
    lines: [ 729 ]
  },
  "817867cf38e50f045453605fbaca4eb7827042ca987cf67165c9645a85214d9d": {
    typeAndName: "function _transfer",
    description: "Reentrancy in XTwitter._transfer(address,address,uint256) (contracts/TestContract.sol#804-867):\n\tExternal calls:\n\t- uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(contractTokenBalance,0,path,address(marketingWallet),block.timestamp) (contracts/TestContract.sol#835-842)\n\tEvent emitted after the call(s):\n\t- Transfer(sender,recipient,amount) (contracts/TestContract.sol#657)\n\t\t- super._transfer(from,to,amount) (contracts/TestContract.sol#866)\n\t- Transfer(sender,recipient,amount) (contracts/TestContract.sol#657)\n\t\t- super._transfer(from,address(this),fees) (contracts/TestContract.sol#863)\n",
    check: "reentrancy-events",
    impact: "Low",
    confidence: "Medium",
    sourceTest: "    function _transfer(\r\n        address from,\r\n        address to,\r\n        uint256 amount\r\n    ) internal override {\r\n        require(from != address(0), \"ERC20: transfer from the zero address\");\r\n        require(to != address(0), \"ERC20: transfer to the zero address\");\r\n        require(\r\n            tradingEnabled ||\r\n                _isExcludedFromFees[from] ||\r\n                _isExcludedFromFees[to],\r\n            \"ERC20: trading is disabled\"\r\n        );\r\n\r\n        if (amount == 0) {\r\n            super._transfer(from, to, 0);\r\n            return;\r\n        }\r\n\r\n        uint256 contractTokenBalance = balanceOf(address(this));\r\n\r\n        bool canSwap = contractTokenBalance >= swapTokensAtAmount;\r\n\r\n        if (canSwap && !swapping && to == uniswapV2Pair) {\r\n            swapping = true;\r\n\r\n            if (contractTokenBalance > 0) {\r\n                address[] memory path = new address[](2);\r\n                path[0] = address(this);\r\n                path[1] = uniswapV2Router.WETH();\r\n\r\n                uniswapV2Router\r\n                    .swapExactTokensForETHSupportingFeeOnTransferTokens(\r\n                        contractTokenBalance,\r\n                        0,\r\n                        path,\r\n                        address(marketingWallet),\r\n                        block.timestamp\r\n                    );\r\n            }\r\n\r\n            swapping = false;\r\n        }\r\n\r\n        uint256 _totalFees;\r\n        if (\r\n            ((_isExcludedFromFees[from] || _isExcludedFromFees[to]) ||\r\n                (from != uniswapV2Pair && to != uniswapV2Pair)) || swapping\r\n        ) {\r\n            _totalFees = 0;\r\n        } else if (from == uniswapV2Pair) {\r\n            _totalFees = block.number <= antiBotBlockEnd ? 25 : 0;\r\n        } else {\r\n            _totalFees = block.number <= antiBotBlockEnd ? 25 : 4;\r\n        }\r\n\r\n        if (_totalFees > 0) {\r\n            uint256 fees = (amount * _totalFees) / 100;\r\n            amount = amount - fees;\r\n            super._transfer(from, address(this), fees);\r\n        }\r\n\r\n        super._transfer(from, to, amount);\r\n    }\r",
    lines: [ 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821,
      822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840,
      841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859,
      860, 861, 862, 863, 864, 865, 866, 867 ]
  },
  "01304cc4312b37902daca45f84c38ca41bb71ffe24e353e8143a18f4c9731983": {
    typeAndName: "function mul",
    description: "SafeMath.mul(uint256,uint256) (contracts/TestContract.sol#85-94) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function mul(uint256 a, uint256 b) internal pure returns (uint256) {\r\n        if (a == 0) {\r\n            return 0;\r\n        }\r\n\r\n        uint256 c = a * b;\r\n        require(c / a == b, \"SafeMath: multiplication overflow\");\r\n\r\n        return c;\r\n    }\r",
    lines: [ 85, 86, 87, 88, 89, 90, 91, 92, 93, 94 ]
  },
  "0503c808e0108b3b224895fab7d445f7ed1b716f3bf9094590653c7ec0619ad9": {
    typeAndName: "function div",
    description: "SafeMathInt.div(int256,int256) (contracts/TestContract.sol#139-145) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function div(int256 a, int256 b) internal pure returns (int256) {\r\n        // Prevent overflow when dividing MIN_INT256 by -1\r\n        require(b != -1 || a != MIN_INT256);\r\n\r\n        // Solidity already throws when dividing by 0.\r\n        return a / b;\r\n    }\r",
    lines: [ 139, 140, 141, 142, 143, 144, 145 ]
  },
  "0597ae61b0a7d596bb9d6115f18ba9ca50e326614caee57b8155a4db524ba57b": {
    typeAndName: "function sub",
    description: "SafeMath.sub(uint256,uint256) (contracts/TestContract.sol#70-72) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function sub(uint256 a, uint256 b) internal pure returns (uint256) {\r\n        return sub(a, b, \"SafeMath: subtraction overflow\");\r\n    }\r",
    lines: [ 70, 71, 72 ]
  },
  "24b0fc240186974a0bb20426e0b895e9b055e6969329635f051a0e8034f4c9f7": {
    typeAndName: "function abs",
    description: "SafeMathInt.abs(int256) (contracts/TestContract.sol#159-162) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function abs(int256 a) internal pure returns (int256) {\r\n        require(a != MIN_INT256);\r\n        return a < 0 ? -a : a;\r\n    }\r",
    lines: [ 159, 160, 161, 162 ]
  },
  "3b1584109de0f2e7d4b85b3d4806af49e031e05a3a5ddf47985cd3a5c4f96d24": {
    typeAndName: "function toInt256Safe",
    description: "SafeMathUint.toInt256Safe(uint256) (contracts/TestContract.sol#171-175) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function toInt256Safe(uint256 a) internal pure returns (int256) {\r\n        int256 b = int256(a);\r\n        require(b >= 0);\r\n        return b;\r\n    }\r",
    lines: [ 171, 172, 173, 174, 175 ]
  },
  "4cc42b978530c0b3d202b143cc576b1c258cb422f564d9c27e3eccec92522f5d": {
    typeAndName: "function mul",
    description: "SafeMathInt.mul(int256,int256) (contracts/TestContract.sol#130-137) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function mul(int256 a, int256 b) internal pure returns (int256) {\r\n        int256 c = a * b;\r\n\r\n        // Detect overflow when multiplying MIN_INT256 with -1\r\n        require(c != MIN_INT256 || (a & MIN_INT256) != (b & MIN_INT256));\r\n        require((b == 0) || (c / b == a));\r\n        return c;\r\n    }\r",
    lines: [ 130, 131, 132, 133, 134, 135, 136, 137 ]
  },
  "70b4280aa93f6eb2c97f92406a75cd9ba30bac85d7bf7a71e8eb4369d74cc422": {
    typeAndName: "function _burn",
    description: "ERC20._burn(address,uint256) (contracts/TestContract.sol#668-677) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function _burn(address account, uint256 amount) internal virtual {\r\n        require(account != address(0), \"ERC20: burn from the zero address\");\r\n        _beforeTokenTransfer(account, address(0), amount);\r\n        _balances[account] = _balances[account].sub(\r\n            amount,\r\n            \"ERC20: burn amount exceeds balance\"\r\n        );\r\n        _totalSupply = _totalSupply.sub(amount);\r\n        emit Transfer(account, address(0), amount);\r\n    }\r",
    lines: [ 668, 669, 670, 671, 672, 673, 674, 675, 676, 677 ]
  },
  "712768d3a481f9b1f37a8cd35c2349b153122c762e1ab1fa90e492ff24916157": {
    typeAndName: "function mod",
    description: "SafeMath.mod(uint256,uint256,string) (contracts/TestContract.sol#116-123) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function mod(\r\n        uint256 a,\r\n        uint256 b,\r\n        string memory errorMessage\r\n    ) internal pure returns (uint256) {\r\n        require(b != 0, errorMessage);\r\n        return a % b;\r\n    }\r",
    lines: [ 116, 117, 118, 119, 120, 121, 122, 123 ]
  },
  "73ca7709734ab8b51a948368df9643cab86fc97ed64cad1fde887b5f6cdb4be9": {
    typeAndName: "function toUint256Safe",
    description: "SafeMathInt.toUint256Safe(int256) (contracts/TestContract.sol#164-167) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function toUint256Safe(int256 a) internal pure returns (uint256) {\r\n        require(a >= 0);\r\n        return uint256(a);\r\n    }\r",
    lines: [ 164, 165, 166, 167 ]
  },
  "828869805626f361f7c641441f787b9a8eb01675fe9ae744d65ae060de753e30": {
    typeAndName: "function sub",
    description: "SafeMathInt.sub(int256,int256) (contracts/TestContract.sol#147-151) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function sub(int256 a, int256 b) internal pure returns (int256) {\r\n        int256 c = a - b;\r\n        require((b >= 0 && c <= a) || (b < 0 && c > a));\r\n        return c;\r\n    }\r",
    lines: [ 147, 148, 149, 150, 151 ]
  },
  "883adadc70fb7eb2cd5136eb24fcd93a1842b6e88470e572c4dbdb1119863e3c": {
    typeAndName: "function div",
    description: "SafeMath.div(uint256,uint256,string) (contracts/TestContract.sol#100-110) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function div(\r\n        uint256 a,\r\n        uint256 b,\r\n        string memory errorMessage\r\n    ) internal pure returns (uint256) {\r\n        require(b > 0, errorMessage);\r\n        uint256 c = a / b;\r\n        // assert(a == b * c + a % b); // There is no case in which this doesn't hold\r\n\r\n        return c;\r\n    }\r",
    lines: [ 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110 ]
  },
  "93bd23634a3bf022810e43138345cf58db61248a704a7d277c8ec3d68c3ad188": {
    typeAndName: "function _msgData",
    description: "Context._msgData() (contracts/TestContract.sol#17-19) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function _msgData() internal view virtual returns (bytes calldata) {\r\n        return msg.data;\r\n    }\r",
    lines: [ 17, 18, 19 ]
  },
  a40074a7206e6c7604771b463c9123cfc4ede6357ef86feb34ea247a1be8f5e1: {
    typeAndName: "function mod",
    description: "SafeMath.mod(uint256,uint256) (contracts/TestContract.sol#112-114) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function mod(uint256 a, uint256 b) internal pure returns (uint256) {\r\n        return mod(a, b, \"SafeMath: modulo by zero\");\r\n    }\r",
    lines: [ 112, 113, 114 ]
  },
  a7d0b3e6ac9063baee00b4997f429ba615b3d9c0cbce75a7df49799b308ff741: {
    typeAndName: "function add",
    description: "SafeMathInt.add(int256,int256) (contracts/TestContract.sol#153-157) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function add(int256 a, int256 b) internal pure returns (int256) {\r\n        int256 c = a + b;\r\n        require((b >= 0 && c >= a) || (b < 0 && c < a));\r\n        return c;\r\n    }\r",
    lines: [ 153, 154, 155, 156, 157 ]
  },
  b49b4889f1b304a84f2984119b9a2fc4e67dfb2f730e0a6de8fe6113d3fbcc39: {
    typeAndName: "function div",
    description: "SafeMath.div(uint256,uint256) (contracts/TestContract.sol#96-98) is never used and should be removed\n",
    check: "dead-code",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "    function div(uint256 a, uint256 b) internal pure returns (uint256) {\r\n        return div(a, b, \"SafeMath: division by zero\");\r\n    }\r",
    lines: [ 96, 97, 98 ]
  },
  c123125a869227c27763e0598715b6f1f07cd2607f32fd8a21f2c0a13205cbf9: {
    typeAndName: "pragma 0.8.9",
    description: "Pragma version0.8.9 (contracts/TestContract.sol#10) allows old versions\n",
    check: "solc-version",
    impact: "Informational",
    confidence: "High",
    sourceTest: "pragma solidity 0.8.9;\r",
    lines: [ 10 ]
  },
  f98c7afc3fe47e152024187afa3ad6234319c766cbd9eecabfe34e59dae45c5f: {
    typeAndName: "",
    description: "solc-0.8.9 is not recommended for deployment\n",
    check: "solc-version",
    impact: "Informational",
    confidence: "High",
    sourceTest: "",
    lines: []
  },
  "36dc409853a1dfac1932fd3129f68d1b4fb6e8f848353cd732544481fd25c98d": {
    typeAndName: "variable _marketingWallet",
    description: "Parameter XTwitter.changeMarketingWallet(address)._marketingWallet (contracts/TestContract.sol#785) is not in mixedCase\n",
    check: "naming-convention",
    impact: "Informational",
    confidence: "High",
    sourceTest: "        address _marketingWallet\r",
    lines: [ 785 ]
  },
  "5075e627b2a338058a96ff59ade74e445eabaf16ad7fe231d76ace1079790fd8": {
    typeAndName: "function PERMIT_TYPEHASH",
    description: "Function IUniswapV2Pair.PERMIT_TYPEHASH() (contracts/TestContract.sol#240) is not in mixedCase\n",
    check: "naming-convention",
    impact: "Informational",
    confidence: "High",
    sourceTest: "    function PERMIT_TYPEHASH() external pure returns (bytes32);\r",
    lines: [ 240 ]
  },
  "5823e67fda8a636852017823c5f328be6f032c1ca1b9bf51b6d4fb17d347c10d": {
    typeAndName: "function MINIMUM_LIQUIDITY",
    description: "Function IUniswapV2Pair.MINIMUM_LIQUIDITY() (contracts/TestContract.sol#271) is not in mixedCase\n",
    check: "naming-convention",
    impact: "Informational",
    confidence: "High",
    sourceTest: "    function MINIMUM_LIQUIDITY() external pure returns (uint);\r",
    lines: [ 271 ]
  },
  "6fec917302bee07fb6b2cb3fc67109a5aed7df1d047bda1df48ac21f955720ac": {
    typeAndName: "function DOMAIN_SEPARATOR",
    description: "Function IUniswapV2Pair.DOMAIN_SEPARATOR() (contracts/TestContract.sol#238) is not in mixedCase\n",
    check: "naming-convention",
    impact: "Informational",
    confidence: "High",
    sourceTest: "    function DOMAIN_SEPARATOR() external view returns (bytes32);\r",
    lines: [ 238 ]
  },
  d51441d319d7710ff998d12e83899a9d644921d950f639a7b86fcc4ddf61e63a: {
    typeAndName: "function WETH",
    description: "Function IUniswapV2Router01.WETH() (contracts/TestContract.sol#311) is not in mixedCase\n",
    check: "naming-convention",
    impact: "Informational",
    confidence: "High",
    sourceTest: "    function WETH() external pure returns (address);\r",
    lines: [ 311 ]
  },
  fed2e25a4b441df85d99115dfaefdea80c17978a6d01b83321cfc7efa290d599: {
    typeAndName: "variable DEAD",
    description: "Variable XTwitter.DEAD (contracts/TestContract.sol#708) is not in mixedCase\n",
    check: "naming-convention",
    impact: "Informational",
    confidence: "High",
    sourceTest: "    address private DEAD = 0x000000000000000000000000000000000000dEaD;\r",
    lines: [ 708 ]
  },
  a9a104ac2e2cafedbc9a7ebb6ecb08422ea7a8c206cf332b24fbffe56a2bf012: {
    typeAndName: "variable amountADesired",
    description: "Variable IUniswapV2Router01.addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256).amountADesired (contracts/TestContract.sol#316) is too similar to IUniswapV2Router01.addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256).amountBDesired (contracts/TestContract.sol#317)\n",
    check: "similar-names",
    impact: "Informational",
    confidence: "Medium",
    sourceTest: "        uint amountADesired,\r",
    lines: [ 316 ]
  },
  "90f512d7ea4bc55817df4e8f6e2d71e1c9a3be558b4011e8e35d81096d1748d9": {
    typeAndName: "variable MAX_INT256",
    description: "SafeMathInt.MAX_INT256 (contracts/TestContract.sol#128) is never used in SafeMathInt (contracts/TestContract.sol#126-168)\n",
    check: "unused-state",
    impact: "Informational",
    confidence: "High",
    sourceTest: "    int256 private constant MAX_INT256 = ~(int256(1) << 255);\r",
    lines: [ 128 ]
  },
  "445da1f2ad481f8e778cb4876646ac35edc01873eb239efac8f78bcf4d486930": {
    typeAndName: "variable swapEnabled",
    description: "XTwitter.swapEnabled (contracts/TestContract.sol#712) should be constant \n",
    check: "constable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    bool public swapEnabled = true;\r",
    lines: [ 712 ]
  },
  "4a4d3f957f29166fb15c84210ff61e09ff6d20d2e88e824dc2e4e771bdef32f9": {
    typeAndName: "variable DEAD",
    description: "XTwitter.DEAD (contracts/TestContract.sol#708) should be constant \n",
    check: "constable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    address private DEAD = 0x000000000000000000000000000000000000dEaD;\r",
    lines: [ 708 ]
  },
  d2aa1054be9d143cef1fbbbd1280bf72dde83b37ebaa2ac33e26704151f50644: {
    typeAndName: "variable pinkLock",
    description: "XTwitter.pinkLock (contracts/TestContract.sol#699) should be constant \n",
    check: "constable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    address public pinkLock = 0x407993575c91ce7643a4d4cCACc9A98c36eE1BBE;\r",
    lines: [ 699 ]
  },
  "15c08a2fcee842f925a9bbc165cb17428fb2b29ee554bd2f7b98db06c7b6ae3e": {
    typeAndName: "variable uniswapV2Router",
    description: "XTwitter.uniswapV2Router (contracts/TestContract.sol#705) should be immutable \n",
    check: "immutable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    IUniswapV2Router02 public uniswapV2Router;\r",
    lines: [ 705 ]
  },
  "2b220c52ecead07c0f17a1db79809a7270e70401e045c3060593bc42c787fe1a": {
    typeAndName: "variable swapTokensAtAmount",
    description: "XTwitter.swapTokensAtAmount (contracts/TestContract.sol#711) should be immutable \n",
    check: "immutable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    uint256 public swapTokensAtAmount;\r",
    lines: [ 711 ]
  },
  "7dec6c2c35ac0e34176759eec346bf392ba6bc76b4b2e35cf19a4985906851ba": {
    typeAndName: "variable uniswapV2Pair",
    description: "XTwitter.uniswapV2Pair (contracts/TestContract.sol#706) should be immutable \n",
    check: "immutable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    address public uniswapV2Pair;\r",
    lines: [ 706 ]
  },
  "86e0328900b1719e2b61733dcd8b7969c50839c8447c6614bdd91408b2259ebf": {
    typeAndName: "variable antiBotBlockAmount",
    description: "XTwitter.antiBotBlockAmount (contracts/TestContract.sol#702) should be immutable \n",
    check: "immutable-states",
    impact: "Optimization",
    confidence: "High",
    sourceTest: "    uint256 public antiBotBlockAmount;\r",
    lines: [ 702 ]
  }
}
