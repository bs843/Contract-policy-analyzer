function normalizeWhitespace(text: string) {
    return text.replace(/\r/g, "").replace(/\t/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function splitByHeadings(text: string): string[] {
    const lines = text.split("\n");
    const chunks: string[] = [];
    let current: string[] = [];

    const isHeading = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (/^(section|clause|article)\s+\d+/i.test(trimmed)) return true;
        if (/^[A-Z][A-Z\s\-]{4,}$/.test(trimmed)) return true;
        if (/^\d+(\.\d+)*\s+[A-Z]/.test(trimmed)) return true;
        return false;
    };

    for (const line of lines) {
        if (isHeading(line) && current.length > 0) {
            chunks.push(current.join("\n").trim());
            current = [line];
        } else {
            current.push(line);
        }
    }

    if (current.length > 0) chunks.push(current.join("\n").trim());
    return chunks.filter(Boolean);
}

export function makeChunks(text: string, maxChunkChars = 2200): string[] {
    const cleaned = normalizeWhitespace(text);
    const rough = splitByHeadings(cleaned);

    const finalChunks: string[] = [];
    for (const part of rough) {
        if (part.length <= maxChunkChars) {
            finalChunks.push(part);
            continue;
        }

        let start = 0;
        while (start < part.length) {
            finalChunks.push(part.slice(start, start + maxChunkChars));
            start += maxChunkChars;
        }
    }

    return finalChunks;
}