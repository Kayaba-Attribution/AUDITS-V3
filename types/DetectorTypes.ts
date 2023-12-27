export interface DetectorResult {
    findType: string;
    title: string;
    check: string;
    impact: string | ((rectCell: { x: any; y: any; width: any; height: any; }) => string);
    confidence: string;
    sourceTest: string;
    lines: number[];
    // Additional fields from the JSON file
    name?: string;
    exploit?: string;
    description?: string;
    recommendation?: string;
    explanation?: string;
    numberOfDuplicates?: number;
}