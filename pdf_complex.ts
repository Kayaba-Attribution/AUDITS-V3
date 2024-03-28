'use strict';
const PDFDocument = require('pdfkit-table');
const fs = require('fs');

//let rawdata = fs.readFileSync('oldInfo.json');
let rawdata = fs.readFileSync('./AuditReport/api_report.json');
let info = JSON.parse(rawdata);

import { DetectorResult } from './types/DetectorTypes';
import slitherFinds from './AuditReport/slither_detectors_clean.json'


import config from './ConfigurationManager';

import { getTop10Data, roundToNearestHundredth, parseNumber, updateApiReport, loadManual } from './utils/pdfMakerUtils';

const manual = loadManual(config.manualReportPath)

if (manual) {
    updateApiReport(manual, info);
    console.log("updated api report from manual")
} else {
    console.log("no manual report found")
}
//Helpers
const helpers = require('./helpers')
const colors = require('colors');


const padWithZero = (number: number) => `0${number}`.slice(-2);

const today = new Date();
const options = {
    day: "numeric" as const,
    month: "numeric" as const,
    year: "numeric" as const
};

const sDay = today.toLocaleDateString("en-US", options);
const year = today.getFullYear();
const month = padWithZero(today.getMonth() + 1);
const date = padWithZero(today.getDate());

const docTime = `${year}${month}${date}`;
const docTimeWithSlashes = `${year}/${month}/${date}`;

var features = info.features
var features_info = info.features_info
var PrivilegeFunctions: any[] = []


const HIGH = (rectCell: { x: any; y: any; width: any; height: any; }) => {
    if (!rectCell) {
        throw new Error('rectCell is undefined');
    }
    const { x, y, width, height } = rectCell;
    doc.image('symbols/high.png', x + 4, y + 10, { width: 10 });
    return `       High`;
}
const MEDIUM = (rectCell: { x: any; y: any; width: any; height: any; }) => {
    if (!rectCell) {
        throw new Error('rectCell is undefined');
    }
    const { x, y, width, height } = rectCell;
    doc.image('symbols/medium.png', x + 4, y + 10, { width: 10 });
    return `       Medium`;
}
const LOW = (rectCell: { x: any; y: any; width: any; height: any; }) => {
    if (!rectCell) {
        throw new Error('rectCell is undefined');
    }
    const { x, y, width, height } = rectCell;
    doc.image('symbols/low.png', x + 4, y + 10, { width: 10 });
    return `       Low`;
}
const INFO = (rectCell: { x: any; y: any; width: any; height: any; }) => {
    if (!rectCell) {
        throw new Error('rectCell is undefined');
    }
    const { x, y, width, height } = rectCell;
    doc.image('symbols/info.png', x + 4, y + 10, { width: 10 });
    return `       Informational`;
}
let background = '#202729'

let finds: Record<string, DetectorResult> = slitherFinds;



let fdinds: Record<string, DetectorResult> = {
    "Unchecked transfer": {
        "numberOfDuplicates": 0,
        "findType": "function",
        "title": "SimpsonsINU.withdrawToken(address,uint256) (contracts/AuditContract.sol#442-445) ignores return value by tokenContract.transfer(msg.sender,_amount) (contracts/AuditContract.sol#444)\n",
        "check": "unchecked-transfer",
        "impact": "High",
        "confidence": "Medium",
        "sourceTest": "function withdrawToken(address _tokenContract, uint256 _amount) external onlyOwner {\r\n        IERC20 tokenContract = IERC20(_tokenContract);\r\n        tokenContract.transfer(msg.sender, _amount);\r\n    }",
        "lines": [
            442,
            443,
            444,
            445
        ],
        "name": "Unchecked transfer",
        "exploit": "contract Token {\n    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);\n}\ncontract MyBank{  \n    mapping(address => uint) balances;\n    Token token;\n    function deposit(uint amount) public{\n        token.transferFrom(msg.sender, address(this), amount);\n        balances[msg.sender] += amount;\n    }\n}\n",
        "description": "The return value of an external transfer/transferFrom call is not checked",
        "recommendation": "Use `SafeERC20`, or ensure that the transfer/transferFrom return value is checked.",
        "explanation": "\nSeveral tokens do not revert in case of failure and return false. If one of these tokens is used in `MyBank`, `deposit` will not revert if the transfer fails, and an attacker can call `deposit` for free.."
    }
}


// ---------------------------------------------------------------------------------------------------------------------
//  *******************************************  AUDIT FILLS  **********************************************************
// ---------------------------------------------------------------------------------------------------------------------

let backgroundMain = '#081F32'
let titleColor = '#DAF7A6'
let textColor = '#D0D3D4'


let name = info.token_name
let symbol = info.token_symbol
let decimals = info.token_decimals
let supply = info.total_supply

let compiler = info.blockScanData.CompilerVersion
let optimization = info.blockScanData.OptimizationUsed
let LicenseType = info.blockScanData.LicenseType

let Codebase = info.chain.id
let baseToken = info.chain.currency
let isLive = info.cannot_buy == "1" ? "No" : "Yes"
let address = info.contract_address
let Platform = info.chain.name

let Description = info.description // TODO: add description to pdf
let Url = info.url
let auditPassed = info.auditPassed
let Language = "Solidity" // ! HARDCODE SOLIDITY
let owner = info.owner_address

let dex = info.dex[0]
let top10Token = getTop10Data(info.holders)
let top10LP = getTop10Data(info.lp_holders)



// ! still need to add
let type = ""
let liquidityLock = "-/-" // TODO add pinksale liquidity lock
PrivilegeFunctions = info.privilegeFunctions

let DocName = `KISHIELD_${name}_Audit_${docTime}.pdf`

console.log(DocName)
let other_contracts = info.contracts
let crw = info.crs


let skipFindingPage = true

let Contracts = {
    headers: [
        { label: "  Name", headerColor: titleColor },
        { label: `Contract`, headerColor: titleColor },
        { label: `Live`, headerColor: titleColor },
    ],
    rows: [
        //[`  DTC`, `${address}`, isLive],
        [`  ${name}`, `${address}`, isLive],
    ],
};

let doc = new PDFDocument({ size: 'A4', bufferPages: true, lineBreak: false });
// ! Default saves audit locally
let destination = "./Audits_Temporal/" + DocName
// ! --save flag saves the audit pdf and updates JSON on production

// TODO add items needed for front end and inject to page folder
if (process.argv.includes("--save")) {

    destination = config.pdfsPath + DocName;
    // * UPDATES JSON WITH PROJECT DATA
    helpers.addAuditJsonData(
        [
            info.name,
            config.projectLogosPath + info.imageName,
            DocName,
            docTimeWithSlashes,
            info.Url,
            info.Description,
            info.Telegram
        ],
        config.projectsJsonPath
    );

    console.log("SAVED to:", destination)
    doc.pipe(fs.createWriteStream(destination));
} else {
    console.log("SAVED to:", destination)
    doc.pipe(fs.createWriteStream(destination));
}

doc.on('pageAdded', () => {

    doc.rect(0, 795, 190, 50);
    doc.fill(getGradient(doc));

    doc.rect(0, 0, 595.28, 850);
    doc.fill(backgroundMain);


    doc.image('background/page.png', 0, 0, { width: 600 })


});

const page = doc.page;
console.log('maxWidth=', page.width, ', maxHeight=', page.height);
// ---------------------------------------------------------------------------------------------------------------------
//                                              Front Page
// ---------------------------------------------------------------------------------------------------------------------

function getGradient(doc: any) {
    const gradient = doc.linearGradient(0, 0, 190, 0);
    gradient.stop(0, titleColor);
    gradient.stop(1, backgroundMain);
    return gradient;
}



//doc.rect(-1, 0, doc.page.width, doc.page.height)
//.fillAndStroke(background, background)
doc.image('logos/main.png', 0, 0, { width: 600 })
doc.fill('#fefefe').stroke();
//doc.image('logos/KAYSHIELDLIGHT.png',90,160, { width: 360 });
doc.fontSize(40).font('fonts/rlight.ttf')
    .text(`Security Audit`, 90, 390, {
        align: 'left'
    })
doc.fontSize(38).font('fonts/rbold.ttf')
    .text(`${name} ${type}`, 90, 460, {
        align: 'left'
    })

doc.fontSize(24).font('fonts/rlight.ttf')
    .text(`${sDay}`, 90, 530, {
        align: 'left'
    })

doc.image(`bLogoImage/${info.imageName}`, 225, 560, { width: 140 })

doc.fontSize(30).font('fonts/rbold.ttf')
if (auditPassed) {
    doc.text(`Audit Passed`, 70, 710, { align: "center" })
} else {

    doc.text(`*Audit NOT Passed`, 70, 710, { align: "center" })
}
// doc.text(`Contract Audited`, 70,720, { align: "center" })
//


// TODO MANUAL DATA ----------------------------------------------------------------------------------


const can_mint = info.can_mint == "1" ? true : false
const tax_above_25 = (parseFloat(info.buy_tax) * 100) + (parseFloat(info.sell_tax) * 100) > 25 ? true : false
const max_tx = info.maxTax
const max_wallet = info.maxWallet
const enable_trade = info.enableTrade
const modify_tax = info.modifyingTaxes
const can_blacklist = info.canBlacklist
const is_honeypot = info.is_honeypot == "1" ? true : false
const cooldown = info.trading_cooldown == "1" ? true : false
const pause_trade = info.pauseTrade
const transfer_pausable = info.transfer_pausable == "1" ? true : false
const is_proxy = info.is_proxy == "1" ? true : false

// TODO ----------------------------------------------------------------------------------

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.fill(titleColor).stroke();

doc.moveDown(0.5);
doc.fontSize(40).font('fonts/rbold.ttf')
    .text("Risk Analysis")
doc.fill(textColor).stroke().fontSize(14).moveDown(0.5).font('fonts/Roboto-Regular.ttf').fillColor(textColor)
doc.text("The table below provides a comprehensive summary of the project's risk analysis, emphasizing high-risk functions that could potentially transform the contract into a honeypot.").moveDown(0.5)
    .text(' This analysis is derived from the critical insights of our thorough audit, focusing on the implications and impact of these findings on the overall integrity and security of the project.').moveDown(0.5)

doc.moveDown(1)
const quickCheckClassification: any = (value: any, indexColumn: number, indexRow: number, row: any, rectRow: any, rectCell: any) => {
    const { x, y, width, height } = rectCell;
    if (indexColumn < 1) {

        if (value == false) {
            doc.image(`symbols/green.png`, x + 12, y + 12, { width: 14 });
        } else {
            doc.image(`symbols/high.png`, x + 12, y + 12, { width: 14 });
        }
        return ``;
    } else if (indexColumn == 2) {
        // split the value into words and get the last one
        let lastWord = value.split(" ").pop();
        // delete the last word from the value
        value = value.replace(lastWord, "");
        // delete the last space from the value
        value = value.slice(0, -1);

        if (lastWord == "false") {
            return quickCheckDict[value].pass
        } else {
            return quickCheckDict[value].fail
        }

        return `${[value]} lo`;
    }
}

type QuickType = {
    [key: string]: {
        pass: string,
        fail: string
    }
}

const quickCheckDict: QuickType = {
    "Can mint": {
        pass: "The contract cannot mint tokens",
        fail: "The contract can mint tokens"
    },
    "Tax above 25%": {
        pass: "Tax is below 25%",
        fail: "Tax is above 25%"
    },
    "Max tx": {
        pass: "There is no max TX or has reasonable limits",
        fail: "Max TX is set, risk of not being able to sell"
    },
    "Min/Max wallet": {
        pass: "There is no wallet limits or has reasonable limits",
        fail: "Min/Max wallet is set, risk of not being able to sell"
    },
    "Enable trade": {
        pass: "Trade is already enabled",
        fail: "Trade enabled by owner, risk of not being able to sell"
    },
    "Modify tax": {
        pass: "Tax cannot be modified or less than 25% total",
        fail: "Tax can be modified, risk of being set above 50%"
    },
    "Can blacklist": {
        pass: "The contract cannot blacklist wallets",
        fail: "The contract can blacklist wallets, risk of being blacklisted"
    },
    "Is honeypot": {
        pass: "The contract is not a honeypot",
        fail: "The contract is a honeypot. STAY AWAY"
    },
    "Trading cooldown": {
        pass: "There is no cooldown or has reasonable limits",
        fail: "There is a cooldown, risk of not being able to sell"
    },
    "Pause trade": {
        pass: "Trade is cannot be paused",
        fail: "Trade is paused, risk of not being able to sell"
    },
    "Pause transfer": {
        pass: "Transfer cannot be paused",
        fail: "Transfer can be paused, risk of not being able to sell"
    },
    "Is proxy": {
        pass: "The contract is not a proxy",
        fail: "The contract is a proxy, risk of being changed"
    }
}

const quickCheck1 = {
    headers: [
        {
            label: "Cat.",
            property: 'value',
            renderer: quickCheckClassification,
            width: 40, padding: 5,
            columnColor: '#212F2A',
            align: "center"
        },
        { label: "Detector", property: 'name', width: 110, renderer: null, padding: 5, },
        { label: "Description", property: 'info', width: 320, renderer: quickCheckClassification, padding: 5 },
    ],
    datas: [
        {
            name: "Can mint",
            value: can_mint,
            info: "Can mint" + " " + can_mint
        },
        {
            name: "Tax above 25%",
            value: tax_above_25,
            info: "Tax above 25%" + " " + tax_above_25
        },
        {
            name: "Max tx",
            value: max_tx,
            info: "Max tx" + " " + max_tx
        },
        {
            name: "Min/Max wallet",
            value: max_wallet,
            info: "Min/Max wallet" + " " + max_wallet
        },
        {
            name: "Enable trade",
            value: enable_trade,
            info: "Enable trade" + " " + enable_trade
        },
        {
            name: "Modify tax",
            value: modify_tax,
            info: "Modify tax" + " " + modify_tax
        },
        {
            name: "Can blacklist",
            value: can_blacklist,
            info: "Can blacklist" + " " + can_blacklist
        },
        {
            name: "Is honeypot",
            value: is_honeypot,
            info: "Is honeypot" + " " + is_honeypot
        },
        {
            name: "Trading cooldown",
            value: cooldown,
            info: "Trading cooldown" + " " + cooldown
        },
        {
            name: "Pause trade",
            value: pause_trade,
            info: "Pause trade" + " " + pause_trade
        },
        {
            name: "Pause transfer",
            value: transfer_pausable,
            info: "Pause transfer" + " " + transfer_pausable
        },
        {
            name: "Is proxy",
            value: is_proxy,
            info: "Is proxy" + " " + is_proxy
        }
    ],
}


doc.table(quickCheck1, {
    columnSpacing: 10,

    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(12), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor),
});





// TODO ----------------------------------------------------------------------------------



// ---------------------------------------------------------------------------------------------------------------------
//                                               Table of Contents
// ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.fill(titleColor).stroke();
doc.image('background/page.png', 0, 0, { width: 600 })

doc.fill(titleColor).stroke();
doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Table of Contents")
doc.moveDown();

doc.fill('#b20000').stroke();
doc.fontSize(15).font('fonts/Roboto-Bold.ttf')
//.text('*AUDIT NOT PASSED').moveDown(0.5)

doc.fill(titleColor).stroke();
// Table of Contents
doc.fontSize(15).font('fonts/Roboto-Bold.ttf')
    .text('1  Audit Summary').font('fonts/Roboto-Regular.ttf')
    .moveDown(0.5).font('fonts/Roboto-Bold.ttf')
    .text('2  Project Overview')
    .moveDown(0.5).fillColor(textColor)
    .text('    2.1  Token Summary')
    .moveDown(0.5)
    .text('    2.2  Main Contract Assessed')
    .moveDown(0.5).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)
    .text('3  Smart Contract Vulnerability Checks')
    .moveDown(0.5).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)
    .text('4  Contract Ownership')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf').fillColor(textColor)
    .text('    4.1 Privileged Functions')
    .moveDown(0.5).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)
    .text('5  Important Notes To The Users')
    .moveDown(0.6).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)

    .text('6  Findings Summary')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf').fillColor(textColor)
    .text('    6.1 Classification of Issues')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf')
    .text('    6.1 Findings Table')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf')

var i = 0
let findCounter = 1
for (const name in finds) {
    if (finds.hasOwnProperty(name)) {
        doc.text(`    ${"0" + findCounter} ${name}  `)
            .moveDown(0.5)
    }
    findCounter++
}

doc.fontSize(15).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)
    .text('7  Statistics').font('fonts/Roboto-Bold.ttf')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf').fillColor(textColor)
    .text('    7.1 Liquidity')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf')
    .text('    7.2 Token Holders')
    .moveDown(0.5).font('fonts/Roboto-Regular.ttf')
    .text('    7.3 Liquidity Holders')
    .moveDown(0.5).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)
    .text('8  Liquidity Ownership')
    .moveDown(0.5).font('fonts/Roboto-Bold.ttf').fillColor(titleColor)
    .text('9  Disclaimer')
// doc.fontSize(12).font('fonts/Roboto-Bold.ttf')
//     .text('4  Statistics')
//     .moveDown(0.5).font('fonts/Roboto-Regular.ttf')
//         .text('    4.1  Liquidity Information')
//         .moveDown(0.5)
//         .text('    4.2  Token Holders Info Information')
//         .moveDown(0.5)
//         .text('    4.3  LP Token Holders Information')
//         .moveDown(0.5)
//     doc.fontSize(12).font('fonts/Roboto-Bold.ttf')
//     doc.text('5  Diclaimer')
//     .moveDown(0.5)


// ---------------------------------------------------------------------------------------------------------------------
//                                                  Summary
// ---------------------------------------------------------------------------------------------------------------------




doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));


doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);


doc.image('background/page.png', 0, 0, { width: 600 })

doc.fill(titleColor).stroke();


doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Audit Summary", { align: "center" })
doc.moveDown(0.5);
function setFontAndSize(type: string) {
    switch (type) {
        case "title":
            doc.fontSize(18).font('fonts/rbold.ttf').fillColor(titleColor);
            break;
        case "text":
            doc.font("fonts/Roboto-Regular.ttf").fontSize(14).fillColor(textColor)
            break;
    }
}

setFontAndSize("text");

doc.text(`This report has been prepared for ${name} ${type} on the ${Platform} network. KISHIELD provides both client-centered and user-centered examination of the smart contracts and their current status when applicable. This report represents the security assessment made to find issues and vulnerabilities on the source code along with the current liquidity and token holder statistics of the protocol.`, {
    lineGap: 6,
})
doc.moveDown()
    .text("A comprehensive examination has been performed, utilizing Cross Referencing, Static Analysis, In-House Security Tools, and line-by-line Manual Review.", {
        lineGap: 6,
    })

doc.moveDown()
    .text("The auditing process pays special attention to the following considerations:", {
        lineGap: 6,
    })
doc.moveDown(0.8)
let summary_bullets = [
    'Ensuring contract logic meets the specifications and intentions of the client without exposing the user’s funds to risk.',
    'Testing the smart contracts against both common and uncommon attack vectors.',
    'Inspecting liquidity and holders statistics to inform the current status to both users and client when applicable.',
    'Assessing the codebase to ensure compliance with current best practices and industry standards.',
    'Verifying contract functions that allow trusted and/or untrusted actors to mint, lock, pause, and transfer assets.',
    'Thorough line-by-line manual review of the entire codebase by industry experts.',
    ''
]
doc.list(summary_bullets, {
    indent: 10,
    bulletRadius: 2.2,
    textIndent: 12,
    bulletIndent: 30,
    lineGap: 4,
    paragraphGap: 10
});


// ---------------------------------------------------------------------------------------------------------------------
//                                                  Overview
// ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.image('background/page.png', 0, 0, { width: 600 })
doc.fill(titleColor).stroke();
doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Project Overview", { align: "center" })
doc.moveDown(0.2);

doc.fontSize(18).font('fonts/rbold.ttf')
    .text("Token Summary", { align: "center" })
doc.moveDown(1);

let opt = ""
optimization == "200" ? opt = "Yes with 200 runs" : opt = "Yes with " + optimization + " runs"

let Tracker = `${name} (${symbol})`
const table = {
    headers: [
        { label: "Parameter", headerColor: titleColor },
        { label: `Result`, headerColor: titleColor },
    ],
    rows: [
        ['Address', `${address}`],
        ['Name', `${name}`],
        ['Token Tracker', `${Tracker}`],
        ['Decimals', `${decimals}`],
        ['Supply', `${supply}`],
        ['Platform', `${Platform}`],
        ['compiler', `${compiler}`],
        ['Optimization', `${opt}`],
        ['LicenseType', `${LicenseType}`],
        ['Language', `${Language}`],
        ['Codebase', `${Codebase}`],
        ['Url', `${Url}`],
    ],
};
doc.table(table, {
    //34455e
    // A4 595.28 x 841.89 (portrait) (about width sizes)
    padding: 15,
    columnSpacing: 10,
    width: 490,
    columnsSize: [120, 370],
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(12), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor), // {Function}
});
doc.moveDown(0.2);
//--------------------------------
// Main Contract Assessed
//--------------------------------
doc.fill(titleColor).stroke();

doc.fontSize(16).font('fonts/rbold.ttf')
    .text("Main Contract Assessed", { align: "center" })
doc.moveDown(1.5);

doc.table(Contracts, {
    //34455e
    // A4 595.28 x 841.89 (portrait) (about width sizes)
    padding: 8,
    columnSpacing: 10,
    width: 490,
    columnsSize: [120, 300, 80],
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(11), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}
});

//doc.text(`*Token audit will be updated when the token is deployed to mainnet.`, 70,730, { align: "center" })
// Move down a bit to provide space between lists
doc.moveDown(0.5);

// ---------------------------------------------------------------------------------------------------------------------
//                                                  Statistics
// ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));
doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.image('background/page.png', 0, 0, { width: 600 })
doc.fill(titleColor).stroke();
doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Statistics")
doc.moveDown(0.2);
doc.fontSize(16).font('fonts/rbold.ttf')
    .text("Liquidity Info")
doc.moveDown(1);



const liqInfo = {
    headers: [
        { label: "  Parameter", headerColor: titleColor },
        { label: `Result`, headerColor: titleColor },
    ],
    rows: [
        ['  Pair Address', dex.pair],
        [`  ${symbol} Reserves`, `${dex.reserve0} ${symbol}`],
        [`  ${baseToken} Reserves`, `${dex.reserve1} ${baseToken}`],
        [`  Liquidity Value`, `$${Math.round(dex.liquidity)} USD`],
    ],
};
// **********  lp info table  ***********

doc.table(liqInfo, {
    columnSpacing: 10,
    width: 490,
    columnsSize: [130, 360],
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(12), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}
});

doc.moveDown(1);


doc.fill(titleColor).stroke();
doc.fontSize(16).font('fonts/rbold.ttf')
    .text(`Token (${symbol}) Holders Info`)
doc.moveDown(1);

const tokenInfo = {
    headers: [
        { label: "  Parameter", headerColor: titleColor },
        { label: `Result`, headerColor: titleColor },
    ],
    rows: [
        [`  ${symbol} Percentage Locked`, `${roundToNearestHundredth(top10Token.percentageLocked)}%`],
        [`  ${symbol} Amount Locked`, `${parseNumber(top10Token.totalLocked)} ${symbol}`],
        ['  Top 10 Percentage Own', `${roundToNearestHundredth(top10Token.totalPercentages)}%`],
        ['  Top 10 Amount Owned', `${parseNumber(top10Token.totalAmount)} ${symbol}`],
        // ['  Top 10 Aprox Value',  `$${crw[1][2][0]} USD`],
    ],
};

// **********  token holders table  ***********
doc.table(tokenInfo, {
    columnSpacing: 10,
    width: 490,
    columnsSize: [170, 320],
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(11), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}
});
// Move down a bit to provide space between lists
doc.moveDown(0.5);

doc.fill(titleColor).stroke();
doc.fontSize(16).font('fonts/rbold.ttf')
    .text(`LP (${symbol}/${baseToken}) Holders Info`)
doc.moveDown(1.5);


const lpInfo = {
    headers: [
        { label: "  Parameter", headerColor: titleColor },
        { label: `Result`, headerColor: titleColor },
    ],
    rows: [
        [`  ${symbol}/${baseToken} % Locked`, `${roundToNearestHundredth(top10LP.percentageLocked * 100)}%`],
        [`  ${symbol}/${baseToken} Amount Locked`, `${parseNumber(top10LP.totalLocked)} ${symbol}/${baseToken}`],
        ['  Top 10 Percentage Owned', `${roundToNearestHundredth(top10LP.totalPercentages * 100)}%`],
        ['  Top 10 Amount Owned', `${parseNumber(top10LP.totalAmount)} ${symbol}/${baseToken}`],
        // ['  Locked Tokens Percentage',  `${crw[2][2][0]}%`],
        // ['  Locked Tokens Amount',  `${crw[2][2][1]} ${symbol}/${baseToken}`],
    ],
};

// 0x71b8214D3b69e101feE63d53364bAACB950e6C88

// **********  lp holders table  ***********
doc.table(lpInfo, {
    columnSpacing: 10,
    width: 490,
    columnsSize: [190, 320],
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(11), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}
});
// Move down a bit to provide space between lists
doc.moveUp(0.5);

doc.font("fonts/Roboto-Regular.ttf").fontSize(6).fillColor(textColor)
    .text(`* All the data diplayed above was taken on-chain on ${docTimeWithSlashes}`)
    .text(`* Data is delivered as is, we do not take responsibility for any errors or omissions in the data`)



// ? ---------------------------------------------------------------------------------------------------------------------
// !                                                GENERAL CHECKS
// ? ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.image('background/page.png', 0, 0, { width: 600 })
doc.fill(titleColor).stroke();
doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Smart Contract Vulnerability Checks", { align: "center" })
doc.moveDown(0.5);

type CheckMarkRenderer = (value: string, indexColumn: number, indexRow: number, row: any, rectRow: any, rectCell: any) => string;

const checkMark: CheckMarkRenderer = (value, indexColumn, indexRow, row, rectRow, rectCell) => {
    const { x, y, width, height } = rectCell;
    if (value == '  Low / No Risk' || value == '  Fixed') {
        doc.image('symbols/check.png', x + 7, y + 8, { width: 14 });
    } else {
        doc.image('symbols/info.png', x + 7, y + 8, { width: 14 });
    }
    return `    ${value}`;
}

const registry = {
    headers: [
        { label: "Vulnerability", property: 'name', width: 200, renderer: null, headerAlign: "center" },
        { label: "Automatic Scan ", property: 'description', width: 85, renderer: null, headerAlign: "center" },
        { label: "Manual Scan ", property: 'description', width: 80, renderer: null, headerAlign: "center" },
        { label: "Result ", property: 'result', width: 120, renderer: checkMark, headerAlign: "center" },
    ],
    datas: [
        { name: "Unencrypted Private Data On-Chain", description: "  Complete", result: "  Low / No Risk" },
        { name: "Code With No Effects", description: "   Complete", result: "  Low / No Risk" },
        { name: "Message call with hardcoded gas amount", description: "   Complete", result: "  Low / No Risk" },
        { name: "Hash Collisions With Multiple Variable Length Arguments", description: "   Complete", result: "  Low / No Risk" },
        { name: "Unexpected Ether balance", description: "   Complete", result: "  Low / No Risk" },
        { name: "Presence of unused variables", description: "   Complete", result: "  Low / No Risk" },
        { name: "Right-To-Left-Override control character (U+202E)", description: "   Complete", result: "  Low / No Risk" },
        { name: "Typographical Error", description: "   Complete", result: "  Low / No Risk" },
        { name: "DoS With Block Gas Limit", description: "   Complete", result: "  Low / No Risk" },
        { name: "Arbitrary Jump with Function Type Variable", description: "   Complete", result: "  Low / No Risk" },
        { name: "Insufficient Gas Griefing", description: "   Complete", result: "  Low / No Risk" },
        { name: "Incorrect Inheritance Order", description: "   Complete", result: "  Low / No Risk" },
        { name: "Write to Arbitrary Storage Location", description: "   Complete", result: "  Low / No Risk" },
        { name: "Requirement Violation", description: "   Complete", result: "  Low / No Risk" },
        { name: "Missing Protection against Signature Replay Attacks", description: "   Complete", result: "  Low / No Risk" },
        { name: "Weak Sources of Randomness from Chain Attributes", description: "   Complete", result: "  Low / No Risk" },
    ],
}

const registry2 = {
    headers: [
        { label: "Vulnerability", property: 'name', width: 200, renderer: null, headerAlign: "center" },
        { label: "Automatic Scan ", property: 'description', width: 85, renderer: null, headerAlign: "center" },
        { label: "Manual Scan ", property: 'description', width: 80, renderer: null, headerAlign: "center" },
        { label: "Result ", property: 'result', width: 120, renderer: checkMark, headerAlign: "center" },
    ],
    datas: [
        { name: "Authorization through tx.origin", description: "   Complete", result: "  Low / No Risk" },
        { name: "Delegatecall to Untrusted Callee", description: "   Complete", result: "  Low / No Risk" },
        { name: "Use of Deprecated Solidity Functions", description: "   Complete", result: "  Low / No Risk" },
        { name: "Assert Violation", description: "   Complete", result: "  Low / No Risk" },
        { name: "Reentrancy", description: "   Complete", result: "  Low / No Risk" },
        { name: "Unprotected SELFDESTRUCT Instruction", description: "   Complete", result: "  Low / No Risk" },
        { name: "Unprotected Ether Withdrawal", description: "   Complete", result: "  Low / No Risk" },
        { name: "Unchecked Call Return Value", description: "   Complete", result: "  Low / No Risk" },
        { name: "Outdated Compiler Version", description: "   Complete", result: "  Low / No Risk" },
        { name: "Integer Overflow and Underflow", description: "   Complete", result: "  Low / No Risk" },
        { name: "Function Default Visibility", description: "   Complete", result: "  Low / No Risk" },

    ],
}

doc.table(registry, {
    x: 0,
    columnSpacing: 8,
    padding: 10,
    prepareHeader: () => doc.font("fonts/Roboto-Bold.ttf").fontSize(12).fillColor(titleColor), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}

});
doc.moveDown();


doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.moveDown(1.5);
doc.table(registry2, {
    x: 0,
    columnSpacing: 8,
    padding: 10,
    prepareHeader: () => doc.font("fonts/Roboto-Bold.ttf").fontSize(12).fillColor(titleColor), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}

});
doc.moveDown(0.2);
doc.image('background/page.png', 0, 0, { width: 600 })
doc.fill(titleColor).stroke();
doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Contract Ownership", { align: "center" })


if (owner != "no" && owner != "none" && owner != "0x0000000000000000000000000000000000000000") {
    console.log('Owner', owner)
    doc.moveDown(0.2)
    doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor)
        .text(`The contract ownership of ${name} is not currently renounced. The ownership of the contract grants special powers to the protocol creators, making them the sole addresses that can call sensible ownable functions that may alter the state of the protocol.`, { align: "center" })
    let ownerLink = "https://etherscan.com/address/" + owner
    doc.moveDown().text(`The current owner is the address ${owner} which can be viewed from: `, { continued: false, align: "center" }).text(`HERE`, { link: ownerLink, continued: true, underline: true, align: "center" })
    doc.moveDown()
    doc.moveDown().text(`The owner wallet has the power to call the functions displayed on the privileged functions chart below, if the owner wallet is compromised this privileges could be exploited.`, { link: undefined, continued: false, underline: false, align: "center" })
    doc.moveDown().text(`We recommend the team to renounce ownership at the right timing if possible, or gradually migrate to a timelock with governing functionalities in respect of transparency and safety considerations.`, { link: "", continued: false, underline: false, align: "center" })
    //doc.moveDown().text(`There is no requirement for the owners to renounce ownership of the contract because the owner privileges over the contract have no effect on the transfer functions and functionality of an ERC-20 token.`, { link: undefined, continued: false, underline: false, align: "center" })
} else if (owner == "none" || owner == "0x0000000000000000000000000000000000000000") {
    doc.moveDown(0.5)
    doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor)
        .text(`The contract does not have an owner.`, { align: "center" })
    doc.moveDown()
        .text(`Having no owner means that all the ownable functions in the contract can not be called by anyone, this often leads to more trust on the project.`, { align: "center" })
    doc.moveDown()
        .text(`This contract has a PairManager that can call special functions: 0xe7b80ad1a73cec99eac142ccb4a6e6a913743cea`, { align: "center" })
    doc.image('symbols/check.png', 240, 650, { width: 100 })
} else {
    doc.moveDown(0.5)
    doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor)
        .text(`The contract ownership of ${name} has been renounced.`, { align: "center" })
    doc.moveDown()
        .text(`Having no owner means that all the ownable functions in the contract can not be called by anyone, this often leads to more trust on the project.`, { align: "center" })
    doc.image('symbols/check.png', 240, 600, { width: 100 })
}
doc.moveDown();
doc.moveDown();

// NOTS TO USERS

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.fontSize(26).font('fonts/rbold.ttf').fill(titleColor).stroke()
doc.text(`Important Notes To The Users:`, { align: "center" })

doc.font("fonts/Roboto-Regular.ttf").fontSize(14).fillColor(textColor)

let notesArr = fs.readFileSync('notes.txt').toString().split("\n");
let notesClean = []
for (let i = 0; i < notesArr.length; i += 2) {
    try {
        notesClean.push(notesArr[i])
    } catch (e) {
        console.log("index out of bounds")
    }
}
doc.moveDown(1.5);
doc.list(notesClean, {
    indent: 10,
    bulletRadius: 2.2,
    textIndent: 12,
    bulletIndent: 30,
    lineGap: 4,
    paragraphGap: 10
});


const extra = {
    headers: [
        { label: "EMISSION SCHEDULE", property: 'name', width: 130, renderer: null },
        { label: "Amount (Millions) ", property: 'description', width: 80, renderer: null },
    ],
    datas: [
        { name: "GENESIS_SUPPLY", description: `35` },
        { name: "MONTH_6_SUPPLY", description: `95` },
        { name: "YEAR_1_SUPPLY", description: `140` },
        { name: "YEAR_2_SUPPLY", description: `180` },
        { name: "YEAR_3_SUPPLY", description: `220` },
        { name: "YEAR_4_SUPPLY", description: `250` },
    ],
}

// doc.moveDown(0.5);

// doc.table(extra, {
//     x: 200,
//     padding: 10,
//     prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(12), // {Function}
//     prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor), // {Function}

// });

// doc.moveDown(0.5);


// Move down a bit to provide space between lists
//doc.moveDown(0.5);

//doc.image('symbols/check.png', 150, 720, { width: 50 })

doc.fontSize(30).font('fonts/rbold.ttf').fill(titleColor).stroke()
doc.fontSize(16).text(`Read carefully the notes section and make your own decision before interacting with the audited contract.
`, { align: "center" })
//doc.text(`  Audit Passed`, { align: "left" })
//LOGO
doc.moveDown(0.5);
if (info.auditPassed) {
    doc.fontSize(30).text(`Audit Passed`, { align: "center" })
    const yLocation = doc.y + 10;
    doc.image('symbols/check.png', 250, yLocation, { width: 100 })
}
else {
    doc.fontSize(30).text(`Audit Failed`, { align: "center" })
    const yLocation = doc.y + 10;
    doc.image('symbols/high.png', 240, yLocation - 10, { width: 100 })
    doc.image('symbols/err.png', 250, yLocation, { width: 80 })
}

//doc.fontSize(30).text(`TEST Audit `, { align: "center" })


doc.fontSize(30).font('fonts/rbold.ttf').fill('#b20000').stroke()
//doc.text(`Audit Not Passed`, { align: "center" })

doc.fontSize(30).font('fonts/rbold.ttf').fill(titleColor).stroke()


// ---------------------------------------------------------------------------------------------------------------------
//                                                Findings Summary
// ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.fill(titleColor).stroke();

doc.moveDown(0.5);
doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Technical Findings Summary")

const IssuesClassification: any = (value: any, indexColumn: number, indexRow: number, row: any, rectRow: any, rectCell: any) => {
    const { x, y, width, height } = rectCell;
    if (indexRow < 4) {
        const symbols = ['high', 'medium', 'low', 'info'];
        doc.image(`symbols/${symbols[indexRow]}.png`, x + 4, y + 10, { width: 10 });
        return `       ${symbols[indexRow].charAt(0).toUpperCase() + symbols[indexRow].slice(1)}`;
    }
    if (indexRow === 4) {
        return `   Total`;
    }
    if (indexRow === 5) {
        return `   Fixed`;
    }
}

const tableClassifications = {
    headers: [
        { label: "    Severity", property: 'name', width: 120, renderer: IssuesClassification },
        { label: "Description", property: 'description', width: 370, renderer: null },
    ],
    datas: [
        { description: 'Exploits, vulnerabilities or errors that will certainly or probabilistically lead towards loss of funds, control, or impairment of the contract and its functions. Issues under this classification are recommended to be fixed with utmost urgency', },
        { description: 'Bugs or issues with that may be subject to exploit, though their impact is somewhat limited. Issues under this classification are recommended to be fixed as soon as possible.', },
        { description: 'Effects are minimal in isolation and do not pose a significant danger to the project or its users. Issues under this classification are recommended to be fixed nonetheless. ', },
        { description: 'Consistency, syntax or style best practices. Generally pose a negligible level of risk, if any.', }
    ],
}

doc.fontSize(16).font('fonts/rbold.ttf')
    .text("Classification of Issues")
doc.moveDown();

doc.fontSize(13).font('fonts/Roboto-Regular.ttf')
    .text("*All Issues Found are Informational")
doc.moveDown();

doc.table(tableClassifications, {
    columnSpacing: 8,
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(11), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}

});

doc.moveDown();

doc.fontSize(16).font('fonts/rbold.ttf').fillColor(titleColor)
    .text("Findings")
doc.moveDown();


let high = 0;
let medium = 0;
let low = 0;
let informational = 0;
let total_findigs = 0;

for (const name in finds) {
    if (finds.hasOwnProperty(name)) {
        const value = finds[name];
        if (finds[name].impact == "High") {
            //finds[name].impact = HIGH
            high++
        }
        if (finds[name].impact == "Medium") {
            //finds[name].impact = MEDIUM
            medium++
        }
        if (finds[name].impact == "Low") {
            //finds[name].impact = LOW
            low++
        }
        if (finds[name].impact == "Informational") {
            // finds[name].impact = INFO
            informational++
        }
    }
}
total_findigs = high + medium + low + informational;
let _fixed = total_findigs
doc.fill(titleColor).stroke();

const tableFindings = {
    headers: [
        { label: "    Severity", property: 'name', width: 120, renderer: IssuesClassification },
        { label: "Found ", property: 'description', width: 50, renderer: null },
    ],
    datas: [
        { description: `    ${high}` },
        { description: `    ${medium}` },
        { description: `    ${low}` },
        { description: `    ${informational}` },
        { description: `    ${total_findigs}` },
        //{ description: `    ${_fixed}` },
    ],
}

doc.table(tableFindings, {
    x: 200,
    columnSpacing: 8,
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(11), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}

});

// ---------------------------------------------------------------------------------------------------------------------
//                                                Findings
// ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.fill(titleColor).stroke();

doc.fontSize(30).font('fonts/rbold.ttf')
    .text("Findings")
doc.moveDown(0.5);
// TODO no finds
// if (Object(finds).keys() < 1) doc.moveDown(0.5).text(`No Findings for ${name}`)

class Finding {
    id!: number;
    severity!: string | ((rectCell: { x: any; y: any; width: any; height: any; }) => string);
    detector!: string;
    description!: string;
    headers!: { label: string; property: string; width: number; renderer: ((data: any) => string) | null; }[];
    datas!: { [key: string]: string; }[];

    constructor(id: number, severity: string | ((rectCell: { x: any; y: any; width: any; height: any; }) => string), detector: string, description: string) {
        // if (typeof severity !== 'string') {
        this.id = id;
        this.severity = severity;
        this.detector = detector;
        this.description = description;
        this.headers = [
            { label: "ID ", property: 'id', width: 30, renderer: null },
            { label: "Severity", property: 'severity', width: 50, renderer: null },
            { label: "Detector", property: 'detector', width: 100, renderer: null },
            { label: "Description", property: 'description', width: 290, renderer: null },
        ];
        this.datas = [
            {
                id: `    ${"0" + this.id}`,
                detector: `${this.detector}`,
                description: `${this.description}`,
                severity: `${this.severity}`
            },
        ];
        // }
    }
}


let counter = 1
const findsKeys = Object.keys(finds);
const findsLength = findsKeys.length;
for (const name in finds) {
    if (finds.hasOwnProperty(name)) {
        const value = finds[name];
        console.log(`Key: ${name}`);
        // console.log(`Value: ${JSON.stringify(value)}`);

        doc.fontSize(18).font('fonts/rbold.ttf').fillColor(titleColor)
            .text(name)
            .moveDown()

        const entrie = new Finding(counter, finds[name].impact, finds[name].check, finds[name].description || 'default')

        counter++
        doc.table(entrie, {
            columnSpacing: 8,
            prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(11), // {Function}
            prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(11).fillColor(textColor), // {Function}

        });
        doc.moveDown(0.3);

        doc.fontSize(15).font('fonts/rbold.ttf').fillColor(titleColor)
            .text("Description")
        doc.moveDown(0.5)
        doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor)
            .text(finds[name].title)
        doc.moveDown(0.5)


        doc.fontSize(15).font('fonts/rbold.ttf').fillColor(titleColor)
            .text("Exploit Example")
        doc.moveDown(0.5)
        doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor)
            .text(finds[name].exploit)
        doc.moveDown()
        doc.fontSize(15).font('fonts/rbold.ttf').fillColor(titleColor)
            .text("Recommendation")
        doc.moveDown(0.5)
        doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor)
            .text(finds[name].recommendation)
        doc.moveDown(3)
        doc.fill(titleColor).stroke();

        // if (i % 2 == 0 && i != finds.length - 1) {
        //     doc.rect(0, 795, 190, 50);
        //     doc.fill(getGradient(doc));
        //     doc.addPage({
        //         size: 'A4',
        //         margin: 60
        //     })
        //     doc.fill(titleColor).stroke();
        // }


        doc.rect(0, 795, 190, 50);
        doc.fill(getGradient(doc));

        doc.addPage({
            size: 'A4',
            margin: 60
        })
        doc.rect(0, 0, 595.28, 850);
        doc.fill(backgroundMain);
        doc.image('background/page.png', 0, 0, { width: 600 })



    }

}

// !---------------------------------------------------------------------------------------------------------------------
// !                                            Privileged functions
// !---------------------------------------------------------------------------------------------------------------------
//--------------------------------
// Contracts Assessed
//--------------------------------
let OnlyOwnerTable = {
    headers: [
        { label: "  Function Name", headerColor: titleColor },
        { label: `Parameters`, headerColor: titleColor },
        // { label: `Visibility`, headerColor: titleColor },
    ],
    rows: [
    ],
};

PrivilegeFunctions.forEach(e => {
    if (e[0] != null) {
        OnlyOwnerTable.rows.push(e as [string, string])
    }
})



// doc.rect(0, 795, 190, 50);
// doc.fill(getGradient(doc));

// doc.addPage({
//     size: 'A4',
//     margin: 60
// })

// doc.rect(0, 0, 595.28, 841.89);
// doc.fill(backgroundMain);
doc.fill(titleColor).stroke();

doc.fontSize(20).font('fonts/rbold.ttf')
    .text("Privileged Functions (onlyOwner & Others)").fillColor(titleColor)
doc.moveDown(1.5);

doc.table(OnlyOwnerTable, {

    columnSpacing: 10,
    //width: 490,
    columnsSize: [300, 150],
    padding: 20,
    align: "center",
    prepareHeader: () => doc.font("fonts/Roboto-Regular.ttf").fontSize(13).fillColor(titleColor), // {Function}
    prepareRow: (row: any, indexColumn: number, indexRow: number, rectRow: any) => doc.font("fonts/Roboto-Regular.ttf").fontSize(12).fillColor(textColor), // {Function}
});




// doc.rect(0, 795, 190, 50);
// doc.fill(getGradient(doc));

// doc.addPage({
//     size: 'A4',
//     margin: 60
// })

// doc.rect(0, 0, 595.28, 841.89);
// doc.fill(backgroundMain);
// doc.image('background/page.png', 0, 0, { width: 600 })

// doc.fill(titleColor).stroke();
// doc.fontSize(20).font('fonts/rbold.ttf')
// //doc.moveDown(2).text(`Liquidity Ownership`, { continued: false, align: "center" })
// //doc.font("fonts/Roboto-Regular.ttf").fontSize(14).fillColor(textColor)
// //doc.moveDown().text(`The token does not have liquidity at the moment of the audit, block ${crw[3]}`, { align: "center" })

// //doc.moveDown().text("Most of the liquidity is currently locked, the lock can be seen here:", { align: "center" })
// doc.moveDown().text(liquidityLock, { align: "center", underline: true, link: liquidityLock })
// doc.image('logos/simpledark.png', 125, 600, { width: 350 })



// ---------------------------------------------------------------------------------------------------------------------
//                                               Disclaimer
// ---------------------------------------------------------------------------------------------------------------------

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

doc.addPage({
    size: 'A4',
    margin: 60
})

doc.rect(0, 0, 595.28, 841.89);
doc.fill(backgroundMain);
doc.image('background/page.png', 0, 0, { width: 600 })
doc.fill(titleColor).stroke();
doc.font("fonts/Roboto-Regular.ttf").fontSize(12)

doc.fontSize(20).font('fonts/rbold.ttf')
    .text("Disclaimer")
doc.moveDown();
doc.fillColor(textColor)
doc.font("fonts/Roboto-Regular.ttf").fontSize(12)
    .text('KISHIELD has conducted an independent audit to verify the integrity of and highlight any vulnerabilities or errors, intentional or unintentional, that may be present in the codes that were provided for the scope of this audit. This audit report does not constitute agreement, acceptance or advocation for the Project that was audited, and users relying on this audit report should not consider this as having any merit for financial advice in any shape, form or nature. The contracts audited do not account for any economic developments that may be pursued by the Project in question, and that the veracity of the findings thus presented in this report relate solely to the proficiency, competence, aptitude and discretion of our independent auditors, who make no guarantees nor assurance that the contracts are completely free of exploits, bugs, vulnerabilities or deprecation of technologies.', {
        lineGap: 4
    })
    .moveDown()
    .text('All information provided in this report does not constitute financial or investment advice, nor should it be used to signal that any persons reading this report should invest their funds without sufficient individual due diligence regardless of the findings presented in this report. Information is provided ‘as is’, and KISHIELD is under no covenant to the completeness, accuracy or solidity of the contracts audited. In no event will KISHIELD or its partners, employees, agents or parties related to the provision of this audit report be liable to any parties for, or lack thereof, decisions and/or actions with regards to the information provided in this audit report.', {
        lineGap: 4
    })
    .moveDown()
    .text('The assessment services provided by KISHIELD is subject to dependencies and under continuing development. You agree that your access and/or use, including but not limited to any services, reports, and materials, will be at your sole risk on an as-is, where-is, and as-available basis. Cryptographic tokens are emergent technologies and carry with them high levels of technical risk and uncertainty. The assessment reports could include false positives, false negatives, and other unpredictable results. The services may access, and depend upon, multiple layers of third-parties.', {
        lineGap: 4
    })
    .moveDown()
doc.moveDown(2);

doc.rect(0, 795, 190, 50);
doc.fill(getGradient(doc));

let pages = doc.bufferedPageRange();
for (let i = 1; i < pages.count; i++) {
    doc.switchToPage(i);

    //Footer: Add page number
    let oldBottomMargin = doc.page.margins.bottom;
    doc.image('background/page.png', 0, 0, { width: 600 })
    doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
    doc
        .text(
            `Page ${i} of ${pages.count - 1}`,
            56,
            doc.page.height - (oldBottomMargin / 2), // Centered vertically in bottom margin
            { align: 'center' }
        ).fillColor('#00000000')
        .text(
            `                                      `,
            20,
            doc.page.height - (oldBottomMargin / 2), // Centered vertically in bottom margin
            { align: 'left', link: "https://kishield.com/" }
        );
    doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
}

doc.end();

