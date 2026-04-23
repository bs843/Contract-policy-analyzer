"use client";

import { useState } from "react";
import ClauseCard from "./ClauseCard";
import QABox from "./QABox";

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

const SAMPLE_TEXT = `SECTION 1 PAYMENT TERMS
The subscriber agrees to pay a monthly fee of $29.99. Fees are non-refundable except where required by law.

SECTION 2 TERMINATION
We may suspend or terminate your account immediately if we believe you violated these terms. You may cancel at any time, but prepaid amounts will not be refunded.

SECTION 3 DATA COLLECTION
We collect device identifiers, approximate location data, IP address, and usage analytics. We may share information with service providers and advertising partners.

SECTION 4 DISPUTE RESOLUTION
Any dispute arising out of these terms shall be resolved by binding arbitration, and you waive the right to participate in a class action lawsuit.`;

function badgeColor(risk: RiskLevel) {
    if (risk === "high") return "#7f1d1d";
    if (risk === "medium") return "#78350f";
    return "#14532d";
}

export default function AnalyzerForm() {
    const [text, setText] = useState(SAMPLE_TEXT);
    const [result, setResult] = useState<AnalyzeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function analyze() {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(typeof data?.error === "string" ? data.error : "Failed to analyze document.");
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
        <div style={{ display: "grid", gap: 20 }}>
            <div
                style={{
                    border: "1px solid #2b365f",
                    borderRadius: 16,
                    padding: 20,
                    background: "#141b34",
                    color: "white",
                }}
            >
                <h1 style={{ marginTop: 0 }}>Contract / Policy Analyzer</h1>
                <p style={{ color: "#cbd5e1" }}>
                    Paste a contract, policy, lease, or terms document to extract clauses,
                    explain them in plain English, and flag risky terms.
                </p>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your document here"
                    style={{
                        width: "100%",
                        minHeight: 250,
                        padding: 14,
                        borderRadius: 12,
                        border: "1px solid #33406d",
                        background: "#0f1530",
                        color: "white",
                        marginTop: 12,
                    }}
                />

                <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                        onClick={analyze}
                        disabled={loading || text.trim().length < 50}
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
                        {loading ? "Analyzing..." : "Analyze document"}
                    </button>

                    <button
                        onClick={() => setText(SAMPLE_TEXT)}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "1px solid #33406d",
                            background: "#0f1530",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Load sample
                    </button>
                </div>

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
            </div>

            {result && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                border: "1px solid #2b365f",
                                borderRadius: 16,
                                padding: 18,
                                background: "#141b34",
                                color: "white",
                            }}
                        >
                            <h2 style={{ marginTop: 0 }}>Document summary</h2>
                            <p style={{ color: "#cbd5e1" }}>{result.summary}</p>
                        </div>

                        <QABox clauses={result.clauses} />

                        <div
                            style={{
                                border: "1px solid #2b365f",
                                borderRadius: 16,
                                padding: 18,
                                background: "#141b34",
                                color: "white",
                            }}
                        >
                            <h2 style={{ marginTop: 0 }}>Overall risk</h2>
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    background: badgeColor(result.overallRisk),
                                    fontWeight: 700,
                                    marginBottom: 12,
                                }}
                            >
                                {result.overallRisk.toUpperCase()}
                            </span>

                            <ul style={{ color: "#cbd5e1" }}>
                                {result.notableConcerns.map((concern, i) => (
                                    <li key={i}>{concern}</li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    <div
                        style={{
                            border: "1px solid #2b365f",
                            borderRadius: 16,
                            padding: 18,
                            background: "#141b34",
                            color: "white",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>Clause breakdown</h2>
                        <div style={{ display: "grid", gap: 16 }}>
                            {result.clauses.map((clause) => (
                                <ClauseCard key={clause.id} clause={clause} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}