import { ClauseResult } from "./types";

function scoreText(text: string, query: string) {
    const qWords = query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);

    const hay = text.toLowerCase();
    let score = 0;

    for (const word of qWords) {
        if (hay.includes(word)) score += 1;
    }

    return score;
}

export function retrieveRelevantClauses(clauses: ClauseResult[], query: string, topK = 4) {
    return [...clauses]
        .map((c) => ({
            clause: c,
            score: scoreText(
                [c.heading, c.category, c.originalText, c.simplifiedExplanation, c.whyItMatters].join(" "),
                query
            ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((x) => x.clause);
}