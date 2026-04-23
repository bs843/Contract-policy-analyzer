import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in environment variables.");
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";