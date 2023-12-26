export interface SlitherOutput {
    success: boolean;
    error: string | null;
    results: Results;
}

interface Results {
    detectors: Detector[];
    upgradeabilityCheck: any[]; // Define this type according to your upgradeability-check structure
}

export interface Detector {
    elements: Element[];
    description: string;
    markdown: string;
    firstMarkdownElement: string;
    id: string;
    check: string;
    impact: string;
    confidence: string;
}

interface Element {
    type: string;
    name: string;
    source_mapping: SourceMapping;
    typeSpecificFields: TypeSpecificFields;
}

export interface SourceMapping {
    start: number;
    length: number;
    filename_relative: string;
    filename_absolute: string;
    filename_short: string;
    isDependency: boolean;
    lines: number[];
    startingColumn: number;
    endingColumn: number;
}

interface TypeSpecificFields {
    parent: Parent;
    signature?: string;
}

interface Parent {
    type: string;
    name: string;
    sourceMapping: SourceMapping;
}