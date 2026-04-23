export type RiskLevel = "low" | "medium" | "high";

export type ClauseCategory =
    | "payment"
    | "termination"
    | "renewal"
    | "liability"
    | "privacy"
    | "data_sharing"
    | "confidentiality"
    | "dispute_resolution"
    | "intellectual_property"
    | "restrictions"
    | "fees_penalties"
    | "other";

export type ClauseResult = {
    id: string;
    heading: string;
    category: ClauseCategory;
    originalText: string;
    simplifiedExplanation: string;
    whyItMatters: string;
    riskLevel: RiskLevel;
    riskReason: string;
    keyEntities: string[];
};

export type AnalyzeResponse = {
    summary: string;
    overallRisk: RiskLevel;
    notableConcerns: string[];
    clauses: ClauseResult[];
};

export type AskResponse = {
    answer: string;
    citations: {
        clauseId: string;
        heading: string;
        excerpt: string;
    }[];
};