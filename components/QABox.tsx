"use client";

import { useState } from "react";

type ClauseResult = {
    id: string;
    heading: string;
    category: string;
    originalText: string;
    simplifiedExplanation: string;
    whyItMatters: string;
    riskLevel: "low" | "medium" | "high";
    riskReason: string;
    keyEntities: string[];
};

type AskResponse = {
    answer: string;
    citations: {
        clauseId: string;
        heading: string;
        excerpt: string;
    }[];
};

export default function QABox({ clauses }: { clauses: ClauseResult[] }) {
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState<AskResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function askQuestion() {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question,
                    clauses,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(typeof data?.error === "string" ? data.error : "Failed to answer question.");
            } else {
                setResult(data);
            }
        } catch {
            setError("Request failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                border: "1px solid #2b365f",
                borderRadius: 16,
                padding: 18,
                background: "#141b34",
                color: "white",
            }}
        >
            <h2 style={{ marginTop: 0 }}>Ask a question</h2>
            <p style={{ color: "#cbd5e1" }}>
                Ask something specific about the document, like termination, refunds, data collection, or penalties.
            </p>

            <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Can they terminate my account without notice?"
                style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #33406d",
                    background: "#0f1530",
                    color: "white",
                    marginBottom: 12,
                }}
            />

            <button
                onClick={askQuestion}
                disabled={loading || question.trim().length < 3}
                style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "#4f7cff",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                }}
            >
                {loading ? "Answering..." : "Ask"}
            </button>

            {error && (
                <pre
                    style={{
                        marginTop: 16,
                        padding: 12,
                        borderRadius: 8,
                        background: "#2a1111",
                        color: "#ffb3b3",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {error}
                </pre>
            )}

            {result && (
                <div style={{ marginTop: 20 }}>
                    <div
                        style={{
                            border: "1px solid #2b365f",
                            borderRadius: 12,
                            padding: 14,
                            background: "#10172d",
                            marginBottom: 14,
                        }}
                    >
                        <strong>Answer:</strong>
                        <p style={{ color: "#cbd5e1", marginBottom: 0 }}>{result.answer}</p>
                    </div>

                    <h3>Citations</h3>
                    <div style={{ display: "grid", gap: 12 }}>
                        {result.citations.map((citation, index) => (
                            <div
                                key={`${citation.clauseId}-${index}`}
                                style={{
                                    border: "1px solid #2b365f",
                                    borderRadius: 12,
                                    padding: 14,
                                    background: "#10172d",
                                }}
                            >
                                <strong>{citation.heading}</strong>
                                <div style={{ color: "#94a3b8", marginTop: 4 }}>{citation.clauseId}</div>
                                <p style={{ color: "#cbd5e1", marginBottom: 0 }}>{citation.excerpt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}