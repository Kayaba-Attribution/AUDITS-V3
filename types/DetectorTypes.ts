export interface DetectorResult {
    findType: string;
    title: string;
    check: string;
    impact: string;
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
