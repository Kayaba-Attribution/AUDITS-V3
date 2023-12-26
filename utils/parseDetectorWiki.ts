import fs from 'fs';
import config from '../ConfigurationManager';

interface ParsedData {
    name: string;
    check: string;
    description: string;
    exploit: string;
    recommendation: string;
    explanation?: string;
}

function parseVulnerabilityData(inputString: string): ParsedData {
    const nameRegex = /##\s+(.*?)(?=\n##|\n###|$)/s;
    const checkRegex = /### Configuration[\s\S]*?\* Check:\s*`(.+?)`/;
    const descriptionRegex = /### Description\s*\n([\s\S]*?)(?=\n###|$)/;
    const exploitRegex = /### Exploit Scenario:\s*\n([\s\S]*?)(?=\n###|$)/;
    const recommendationRegex = /### Recommendation\s*\n([\s\S]*?)(?=\n##|$)/;

    const name = nameRegex.exec(inputString)?.[1].trim() ?? '';
    const check = checkRegex.exec(inputString)?.[1].trim() ?? '';
    const description = descriptionRegex.exec(inputString)?.[1].trim() ?? '';
    let exploit = exploitRegex.exec(inputString)?.[1].trim() ?? '';
    const recommendation = recommendationRegex.exec(inputString)?.[1].trim() ?? '';

    // remove ```solidity\n and ``` from exploit
    exploit = exploit.replace(/```solidity\n/g, '');
    // split exploit after the last ``` and set exploit to the first element of the array
    let exploitInfo = exploit.split('```');
    exploit = exploitInfo[0];
    const explanation = exploitInfo[1];

    return { name, check, description, exploit, recommendation, explanation };
}

function parseMarkdownFile(filePath: string): ParsedData[] {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sections = fileContent.split(/\n(?=## )/); // Split by '## ' but only at the start of a new line
    return sections.map(section => parseVulnerabilityData(section));
}

function saveToJsonFile(data: ParsedData[], outputFilePath: string): void {
    const result = data.reduce((acc, item) => {
        if (item.check) {
            acc[item.check] = {
                name: item.name,
                check: item.check,
                description: item.description,
                exploit: item.exploit,
                recommendation: item.recommendation,
                explanation: item.explanation,
            };
        }
        return acc;
    }, {} as any);

    fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
}

// Usage
// const filePath = 'slither.wiki/Detector-Documentation.md'
// const parsedData = parseMarkdownFile(filePath);
// saveToJsonFile(parsedData, config.vulnerabilitiesInfoPath);


// console.log(parsedData);
