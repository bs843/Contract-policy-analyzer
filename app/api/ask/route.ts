import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const BodySchema = z.object({
    question: z.string().min(3),
    clauses: z.array(
        z.object({
            id: z.string(),
            heading: z.string(),
            category: z.string(),
            originalText: z.string(),
            simplifiedExplanation: z.string(),
            whyItMatters: z.string(),
            riskLevel: z.enum(["low", "medium", "high"]),
            riskReason: z.string(),
            keyEntities: z.array(z.string()),
        })
    ),
});

function safeJsonParse<T>(value: string): T {
    const cleaned = value
        .trim()
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/, "")
        .trim();

    return JSON.parse(cleaned) as T;
}

function retrieveRelevantClauses(
    clauses: Array<{
        id: string;
        heading: string;
        category: string;
        originalText: string;
        simplifiedExplanation: string;
        whyItMatters: string;
        riskLevel: "low" | "medium" | "high";
        riskReason: string;
        keyEntities: string[];
    }>,
    question: string,
    topK = 4
) {
    const qWords = question.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

    return [...clauses]
        .map((clause) => {
            const haystack = [
                clause.heading,
                clause.category,
                clause.originalText,
                clause.simplifiedExplanation,
                clause.whyItMatters,
            ]
                .join(" ")
                .toLowerCase();

            let score = 0;
            for (const word of qWords) {
                if (haystack.includes(word)) score++;
            }

            return { clause, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((item) => item.clause);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = BodySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const relevantClauses = retrieveRelevantClauses(
            parsed.data.clauses,
            parsed.data.question
        );

        const prompt = `
You answer questions about a contract or policy.
Use only the provided clauses.
Do not give legal advice.
If the answer is not clearly supported by the clauses, say so.

Return strict JSON only with this shape:
{
  "answer": "string",
  "citations": [
    {
      "clauseId": "string",
      "heading": "string",
      "excerpt": "string"
    }
  ]
}
`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: `Question: ${parsed.data.question}\n\nRelevant clauses:\n${JSON.stringify(
                        relevantClauses,
                        null,
                        2
                    )}`,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content || "{}";
        const result = safeJsonParse<{
            answer: string;
            citations: { clauseId: string; heading: string; excerpt: string }[];
        }>(content);

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to answer question." },
            { status: 500 }
        );
    }
}