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

function badgeColor(risk: "low" | "medium" | "high") {
    if (risk === "high") return "#7f1d1d";
    if (risk === "medium") return "#78350f";
    return "#14532d";
}

export default function ClauseCard({ clause }: { clause: ClauseResult }) {
    return (
        <div
            style={{
                border: "1px solid #2b365f",
                borderRadius: 16,
                padding: 16,
                background: "#10172d",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 12,
                }}
            >
                <div>
                    <h3 style={{ margin: 0 }}>{clause.heading}</h3>
                    <div style={{ color: "#94a3b8", marginTop: 4 }}>
                        Category: {clause.category}
                    </div>
                </div>

                <span
                    style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: badgeColor(clause.riskLevel),
                        fontWeight: 700,
                        height: "fit-content",
                    }}
                >
                    {clause.riskLevel.toUpperCase()} RISK
                </span>
            </div>

            <p>
                <strong>Plain-English explanation:</strong> {clause.simplifiedExplanation}
            </p>
            <p>
                <strong>Why it matters:</strong> {clause.whyItMatters}
            </p>
            <p>
                <strong>Risk reason:</strong> {clause.riskReason}
            </p>

            {clause.keyEntities.length > 0 && (
                <p>
                    <strong>Key entities:</strong> {clause.keyEntities.join(", ")}
                </p>
            )}

            <details>
                <summary style={{ cursor: "pointer" }}>Show original text</summary>
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 12, color: "#cbd5e1" }}>
                    {clause.originalText}
                </pre>
            </details>
        </div>
    );
}