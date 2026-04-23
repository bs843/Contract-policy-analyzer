import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeDocument } from "@/lib/analyzer";

const BodySchema = z.object({
    text: z.string().min(50, "Please provide a longer document."),
});

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

        const result = await analyzeDocument(parsed.data.text);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to analyze document." },
            { status: 500 }
        );
    }
}