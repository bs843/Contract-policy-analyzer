import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

type RiskLevel = "low" | "medium" | "high";

type ClauseCategory =
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

type ClauseResult = {
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

type AnalyzeResponse = {
    summary: string;
    overallRisk: RiskLevel;
    notableConcerns: string[];
    clauses: ClauseResult[];
};

function safeJsonParse<T>(value: string): T {
    const cleaned = value
        .trim()
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/, "")
        .trim();

    return JSON.parse(cleaned) as T;
}

function makeChunks(text: string, maxChunkChars = 2200): string[] {
    const cleaned = text.replace(/\r/g, "").trim();

    if (cleaned.length <= maxChunkChars) {
        return [cleaned];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < cleaned.length) {
        chunks.push(cleaned.slice(start, start + maxChunkChars));
        start += maxChunkChars;
    }

    return chunks;
}

async function analyzeChunk(chunk: string, index: number): Promise<ClauseResult> {
    const prompt = `
You are a contract and policy analysis assistant.
Analyze ONE clause or chunk of a document.
Return strict JSON only with this shape:
{
  "heading": "string",
  "category": "payment | termination | renewal | liability | privacy | data_sharing | confidentiality | dispute_resolution | intellectual_property | restrictions | fees_penalties | other",
  "originalText": "string",
  "simplifiedExplanation": "string",
  "whyItMatters": "string",
  "riskLevel": "low | medium | high",
  "riskReason": "string",
  "keyEntities": ["string"]
}

Do not give legal advice.
Be faithful to the text.
`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: chunk },
        ],
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = safeJsonParse<Omit<ClauseResult, "id">>(content);

    return {
        id: `clause-${index + 1}`,
        heading: parsed.heading || `Clause ${index + 1}`,
        category: parsed.category || "other",
        originalText: parsed.originalText || chunk,
        simplifiedExplanation: parsed.simplifiedExplanation || "No explanation generated.",
        whyItMatters: parsed.whyItMatters || "",
        riskLevel: parsed.riskLevel || "medium",
        riskReason: parsed.riskReason || "",
        keyEntities: Array.isArray(parsed.keyEntities) ? parsed.keyEntities : [],
    };
}

export async function analyzeDocument(text: string): Promise<AnalyzeResponse> {
    const chunks = makeChunks(text);

    const clauses = await Promise.all(
        chunks.map((chunk, index) => analyzeChunk(chunk, index))
    );

    const summaryPrompt = `
You are a contract and policy summarizer.
Return strict JSON only with this shape:
{
  "summary": "string",
  "overallRisk": "low | medium | high",
  "notableConcerns": ["string"]
}

Do not give legal advice.
Base your answer only on the provided clause analysis.
`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: summaryPrompt },
            {
                role: "user",
                content: JSON.stringify(clauses, null, 2),
            },
        ],
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = safeJsonParse<{
        summary?: string;
        overallRisk?: RiskLevel;
        notableConcerns?: string[];
    }>(content);

    return {
        summary: parsed.summary || "No summary generated.",
        overallRisk: parsed.overallRisk || "medium",
        notableConcerns: Array.isArray(parsed.notableConcerns)
            ? parsed.notableConcerns
            : [],
        clauses,
    };
}